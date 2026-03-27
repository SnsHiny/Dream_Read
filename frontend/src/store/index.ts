import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { User, Dream, UserProfile } from '@/types';
import { api } from '@/utils/api';

let profileRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let profileRefreshInFlight = false;
let profileRefreshQueuedUserId: string | null = null;

async function refreshProfileInBackground(userId: string, set: any) {
  if (profileRefreshInFlight) {
    profileRefreshQueuedUserId = userId;
    return;
  }

  profileRefreshInFlight = true;
  try {
    const response = await api.profile.refresh(userId);
    const profile = response.profile || response;
    set({ profile });
  } catch {
  } finally {
    profileRefreshInFlight = false;
    if (profileRefreshQueuedUserId) {
      const nextUserId = profileRefreshQueuedUserId;
      profileRefreshQueuedUserId = null;
      await refreshProfileInBackground(nextUserId, set);
    }
  }
}

export interface AppState {
  user: User | null;
  dreams: Dream[];
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setDreams: (dreams: Dream[]) => void;
  addDream: (dream: Dream) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  fetchUser: (userId: string) => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<User>;
  fetchDreams: (userId: string, page?: number, search?: string) => Promise<void>;
  createDream: (data: { content: string; inputType?: 'text' | 'voice'; mood?: string; dreamDate?: string }) => Promise<Dream>;
  deleteDream: (dreamId: string) => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  refreshProfile: (userId: string) => Promise<void>;
  clearError: () => void;
  
  login: (phoneNumber: string, code: string) => Promise<User>;
  logout: () => void;
}

type PersistedState = { user: User | null };

const persistStorageName = 'dream-app-storage';

const safeStateStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    const value = window.localStorage.getItem(name);
    if (!value) return null;
    try {
      JSON.parse(value);
      return value;
    } catch {
      window.localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(name);
  },
};

const safePersistStorage = createJSONStorage<PersistedState>(() => safeStateStorage);

export const useStore = create<AppState>()(
  persist<AppState, [], [], PersistedState>(
    (set, get) => ({
      user: null,
      dreams: [],
      profile: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setDreams: (dreams) => set({ dreams }),
      addDream: (dream) => set((state) => ({ dreams: [dream, ...state.dreams] })),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      fetchUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.user.get(userId);
          // Check if response has user property or is the user object itself
          const user = response.user || response;
          set({ user, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      createUser: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = get().user;
          const dataToSubmit = currentUser ? { userId: currentUser.id, ...userData } : userData;
          
          const response = await api.user.create(dataToSubmit);
          const user = response.user || response;
          set({ user, isLoading: false });
          return user;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      fetchDreams: async (userId: string, page = 1, search?: string) => {
        set({ isLoading: true, error: null });
        try {
          // 如果没有搜索词且是第一页，先检查缓存
          // 如果缓存中有数据，且我们认为它是最新的（这里简单判断有数据就先显示）
          // 实际上为了保证数据一致性，通常还是需要请求后端，或者后端返回 304
          // 用户的需求是：没有新数据时读缓存。
          // 我们可以在 fetchDreams 前对比一下本地 dreams 长度和 total？
          // 但 fetchDreams 是获取分页数据的，本地 dreams 可能是所有数据或者部分数据
          
          // 优化策略：
          // 1. 总是先发起请求获取最新数据
          // 2. 但如果本地已有数据，先不展示 loading 状态？(这会导致 UI 闪烁)
          // 3. 或者比较本地数据和远程数据的时间戳？
          
          // 按照用户需求： "在没有新梦境添加进来的时候，数据从缓存中读取"
          // 这意味着我们需要一个机制知道 "是否有新梦境"。通常这需要一次轻量级的 check 请求。
          // 或者我们在 createDream 成功后，已经把新梦境 unshift 到 dreams 数组最前面了。
          // 那么 HistoryPage 进来时，dreams 数组里已经是包含最新数据的了（如果是从 DreamPage 跳转过来的）。
          // 所以如果 state.dreams 已经有数据，且 page=1, search为空，我们可以选择不请求？
          // 但这样会导致用户在其他设备添加的梦境无法同步。
          
          // 折中方案：
          // 1. 如果是第一页且无搜索，且本地有数据，先设置为 isLoading: false (或不设置 true)，让用户先看旧数据
          // 2. 后台静默刷新数据
          
          const currentDreams = get().dreams;
          const isFirstPageLoad = page === 1 && !search;
          
          if (isFirstPageLoad && currentDreams.length > 0) {
             // 有缓存数据，不显示全屏 loading，静默更新
             // set({ isLoading: true }); // 注释掉这行，实现"从缓存读取"的体验
          } else {
             set({ isLoading: true, error: null });
          }

          const response = await api.dream.list(userId, page, 10, search);
          const newDreams = response.dreams || [];
          
          // 如果是第一页刷新，覆盖；如果是加载更多，追加 (这里目前逻辑全是覆盖 setDreams)
          // 现有逻辑是 setDreams(dreams)，即每次 fetch 都是替换当前列表
          // 如果要实现 "有新数据才更新"，需要对比。
          // 简单起见，我们总是更新 store，但因为 React diff 算法，如果数据没变，DOM 不会重绘。
          
          set({ dreams: newDreams, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      createDream: async (data: { content: string; inputType?: 'text' | 'voice'; mood?: string; dreamDate?: string }) => {
        const { user } = get();
        if (!user) throw new Error('请先完善个人信息');
        
        set({ isLoading: true, error: null });
        try {
          const userId = user.id || user._id;
          if (!userId) throw new Error('用户ID缺失');
          const response = await api.dream.create({
            userId,
            ...data,
          });
          const dream = response.dream || response;
          set((state) => ({ 
            dreams: [dream, ...state.dreams],
            isLoading: false 
          }));

          if (profileRefreshTimer) {
            clearTimeout(profileRefreshTimer);
          }
          profileRefreshTimer = setTimeout(() => {
            refreshProfileInBackground(userId, set);
          }, 300);

          return dream;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      deleteDream: async (dreamId: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.dream.delete(dreamId);
          set((state) => ({
            dreams: state.dreams.filter((d) => d.id !== dreamId && d._id !== dreamId),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      fetchProfile: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.profile.get(userId);
          const profile = response.profile || response;
          set({ profile, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      refreshProfile: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.profile.refresh(userId);
          const profile = response.profile || response;
          set({ profile, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      login: async (phoneNumber: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.auth.login(phoneNumber, code);
          const user = response.user || response;
          set({ user, isLoading: false });
          return user;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, dreams: [], profile: null });
        safeStateStorage.removeItem(persistStorageName);
      },
    }),
    {
      name: persistStorageName,
      storage: safePersistStorage,
      partialize: (state): PersistedState => ({ user: state.user }),
    }
  )
);
