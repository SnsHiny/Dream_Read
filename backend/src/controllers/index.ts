import { Request, Response } from 'express';
import { dreamAnalysisService } from '../services/dreamAnalysis';
import { getMemoryStore, generateId } from '../utils/memoryStore';
import { query } from '../utils/db';

const memoryStore = getMemoryStore();

// Helper to convert camelCase to snake_case for DB
const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

function resolveMood(mood: unknown, user: any) {
  if (typeof mood === 'string' && mood.trim()) return mood.trim();
  return user?.recentMood || user?.psychologicalStatus || null;
}

const mapUserToDb = (userData: any) => {
  const dbData: any = {};
  for (const key in userData) {
    // Skip id/userId as they are handled separately
    if (key === 'id' || key === 'userId') continue;
    dbData[toSnakeCase(key)] = userData[key];
  }
  return dbData;
};

export const mapUserFromDb = (dbUser: any) => {
  if (!dbUser) return null;
  return {
    ...dbUser,
    id: dbUser.id,
    nickname: dbUser.nickname,
    gender: dbUser.gender,
    age: dbUser.age,
    occupation: dbUser.occupation,
    familyEnvironment: dbUser.family_environment,
    personalGoals: dbUser.personal_goals,
    psychologicalStatus: dbUser.psychological_status,
    sleepQuality: dbUser.sleep_quality,
    stressLevel: dbUser.stress_level,
    recentMood: dbUser.recent_mood,
    dreamFrequency: dbUser.dream_frequency,
    phoneNumber: dbUser.phone_number,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  };
};

const mapProfileToDb = (profileData: any) => {
  return {
    dream_themes: profileData.dreamThemes,
    emotional_trends: profileData.emotionalTrends,
    profile_summary: profileData.profileSummary,
    archetype_description: profileData.archetypeDescription
  };
};

const mapProfileFromDb = (dbProfile: any) => {
  if (!dbProfile) return null;
  return {
    ...dbProfile,
    dreamThemes: dbProfile.dream_themes,
    emotionalTrends: dbProfile.emotional_trends,
    profileSummary: dbProfile.profile_summary,
    archetypeDescription: dbProfile.archetype_description,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
  };
};

const mapDreamFromDb = (dbDream: any) => {
  if (!dbDream) return null;
  return {
    ...dbDream,
    id: dbDream.id,
    userId: dbDream.user_id,
    dreamDate: dbDream.dream_date,
    inputType: dbDream.input_type,
    tags: dbDream.tags || [],
    createdAt: dbDream.created_at,
    updatedAt: dbDream.updated_at,
  };
};

const normalizeDream = (dream: any) => {
  if (!dream) return null;
  if (dream.user_id || dream.input_type || dream.created_at) return mapDreamFromDb(dream);
  return {
    ...dream,
    id: dream.id || dream._id,
    userId: dream.userId || dream.user_id,
    dreamDate: dream.dreamDate || dream.dream_date,
    inputType: dream.inputType || dream.input_type,
    tags: dream.tags || [],
    createdAt: dream.createdAt || dream.created_at,
    updatedAt: dream.updatedAt || dream.updated_at,
  };
};

export const userController = {
  async createOrUpdateUser(req: Request, res: Response) {
    try {
      const { userId, ...userData } = req.body;
      
      // Convert camelCase fields to snake_case for DB
      const dbUserData = mapUserToDb(userData);

      let user;
      try {
        const id = userId || generateId();
        const cols = Object.keys(dbUserData);
        const insertCols = ['id', ...cols, 'created_at', 'updated_at'];
        const insertVals = [id, ...cols.map((c) => dbUserData[c])];
        const placeholders = insertVals.map((_, i) => `$${i + 1}`).join(', ');
        const colSql = insertCols.map((c) => `"${c}"`).join(', ');
        const updateSet = cols.length
          ? cols.map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ') + ', "updated_at" = now()'
          : '"updated_at" = now()';

        const sql = `insert into users (${colSql}) values (${placeholders}, now(), now())
          on conflict (id) do update set ${updateSet}
          returning *`;

        const result = await query<any>(sql, insertVals);
        user = result.rows[0];
      } catch (dbError) {
        console.warn('DB update failed, using memory store', dbError);
        const id = userId || generateId();
        user = {
          _id: id,
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.users.set(id, user);
        return res.json({ success: true, user });
      }
      
      res.json({ success: true, user: mapUserFromDb(user) });
    } catch (error) {
      console.error('创建/更新用户错误:', error);
      res.status(500).json({ success: false, error: '保存用户信息失败' });
    }
  },

  async getUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      let user;
      try {
        const result = await query<any>('select * from users where id = $1 limit 1', [userId]);
        user = mapUserFromDb(result.rows[0]);
      } catch (dbError) {
        user = memoryStore.users.get(userId);
      }
      
      if (!user) {
        return res.status(404).json({ success: false, error: '用户不存在' });
      }
      
      res.json({ success: true, user });
    } catch (error) {
      console.error('获取用户错误:', error);
      res.status(500).json({ success: false, error: '获取用户信息失败' });
    }
  }
};

export const dreamController = {
  async createDream(req: Request, res: Response) {
    try {
      const { userId, content, inputType, mood, dreamDate } = req.body;
      const isValidDate = typeof dreamDate === 'string' && 
        /^\d{4}-\d{2}-\d{2}$/.test(dreamDate) && 
        !isNaN(new Date(dreamDate).getTime()) && 
        new Date(dreamDate) <= new Date();
      const dreamDateStr = isValidDate ? dreamDate : null;
      
      let user;
      try {
        const result = await query<any>('select * from users where id = $1 limit 1', [userId]);
        user = mapUserFromDb(result.rows[0]);
      } catch (dbError) {
        user = memoryStore.users.get(userId);
      }
      
      if (!user) {
        return res.status(404).json({ success: false, error: '用户不存在' });
      }

      const userInfo = {
        nickname: user.nickname,
        gender: user.gender,
        age: user.age,
        occupation: user.occupation,
        familyEnvironment: user.familyEnvironment,
        personalGoals: user.personalGoals,
        psychologicalStatus: user.psychologicalStatus,
        sleepQuality: user.sleepQuality,
        stressLevel: user.stressLevel,
        recentMood: user.recentMood,
        dreamFrequency: user.dreamFrequency,
      };

      const analysis = await dreamAnalysisService.analyzeDream(content, userInfo);
      
      const tags = analysis.coreSymbols.map(s => s.symbol);
      const tagsJson = JSON.stringify(tags);
      const analysisJson = JSON.stringify(analysis);
      
      let dream;
      try {
        const id = generateId();
        const resolvedMood = resolveMood(mood, user);
        const result = await query<any>(
          'insert into dreams (id, user_id, dream_date, content, input_type, mood, tags, analysis, created_at, updated_at) values ($1,$2, coalesce($3::date, current_date), $4,$5,$6,$7::jsonb,$8::jsonb, now(), now()) returning *',
          [id, userId, dreamDateStr, content, inputType || 'text', resolvedMood, tagsJson, analysisJson]
        );
        dream = result.rows[0];
      } catch (dbError) {
        console.error('DB insert dream failed:', (dbError as any)?.message || dbError);
        // 使用内存存储
        const id = generateId();
        dream = {
          id,
          _id: id,
          userId,
          dreamDate: dreamDateStr || new Date().toISOString().slice(0, 10),
          content,
          inputType: inputType || 'text',
          mood: resolveMood(mood, user),
          tags,
          analysis,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.dreams.set(id, dream);
      }
      
      res.json({ success: true, dream: normalizeDream(dream) });
    } catch (error) {
      console.error('创建梦境错误:', error);
      res.status(500).json({ success: false, error: '解析梦境失败，请稍后重试' });
    }
  },

  async getDreams(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, search } = req.query;
      
      let dreams: any[] = [];
      let total = 0;
      let degraded = false;
      try {
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const offset = (pageNum - 1) * limitNum;

        const params: any[] = [userId];
        let where = 'user_id = $1';
        if (search) {
          params.push(`%${String(search)}%`);
          where += ` and content ilike $${params.length}`;
        }

        const countResult = await query<{ count: string }>(
          `select count(*)::text as count from dreams where ${where}`,
          params
        );
        total = Number(countResult.rows[0]?.count || 0);

        params.push(limitNum);
        params.push(offset);

        const listResult = await query<any>(
          `select * from dreams where ${where} order by dream_date desc nulls last, created_at desc limit $${params.length - 1} offset $${params.length}`,
          params
        );
        dreams = (listResult.rows || []).map(mapDreamFromDb);
      } catch (dbError: any) {
        console.warn('DB query failed, using memory store:', dbError.message);
        // Fallback to memory store
        const all = Array.from(memoryStore.dreams.values())
          .map(normalizeDream)
          .filter((dream: any) => dream.userId === userId)
          .filter((dream: any) => (search ? String(dream.content || '').includes(String(search)) : true))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        total = all.length;
        dreams = all.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));
        degraded = true;
      }

      if (dreams.length === 0) {
        // Return success with empty degraded state, don't error out
        // Only return 503 if we truly failed AND have no data
        // But here we just return empty list to frontend
        return res.json({ 
          success: true, 
          dreams: [], 
          degraded: true,
          pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 0 }
        });
      }
    
    // Check if headers already sent before sending response
    if (!res.headersSent) {
      res.json({ 
        success: true, 
        dreams, 
        degraded,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    }
  } catch (error) {
    console.error('获取梦境列表错误:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: '获取梦境列表失败' });
    }
  }
},

  async getDream(req: Request, res: Response) {
    try {
      const { dreamId } = req.params;
      
      let dream;
      try {
        const result = await query<any>('select * from dreams where id = $1 limit 1', [dreamId]);
        dream = mapDreamFromDb(result.rows[0]);
      } catch (dbError) {
        dream = normalizeDream(memoryStore.dreams.get(dreamId));
      }
      
      if (!dream) {
        return res.status(404).json({ success: false, error: '梦境不存在' });
      }
      
      res.json({ success: true, dream });
    } catch (error) {
      console.error('获取梦境详情错误:', error);
      res.status(500).json({ success: false, error: '获取梦境详情失败' });
    }
  },

  async deleteDream(req: Request, res: Response) {
    try {
      const { dreamId } = req.params;
      
      try {
        await query('delete from dreams where id = $1', [dreamId]);
      } catch (dbError) {
        memoryStore.dreams.delete(dreamId);
      }
      
      res.json({ success: true, message: '梦境已删除' });
    } catch (error) {
      console.error('删除梦境错误:', error);
      res.status(500).json({ success: false, error: '删除梦境失败' });
    }
  }
};

export const profileController = {
  async getProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      let profile;
      try {
        const result = await query<any>('select * from profiles where user_id = $1 limit 1', [userId]);
        profile = mapProfileFromDb(result.rows[0]);
      } catch (dbError) {
        profile = memoryStore.profiles.get(userId);
      }
      
      // 优化逻辑：如果用户画像已存在且最近更新时间在 24 小时内，直接返回缓存，不重新生成
      // 除非是强制刷新（通过 refreshProfile 接口）
      if (!profile) {
        let dreams = [];
        try {
          const result = await query<any>(
            'select content, analysis, dream_date, created_at from dreams where user_id = $1 order by dream_date desc nulls last, created_at desc',
            [userId]
          );
          dreams = result.rows;
        } catch (dbError) {
          dreams = Array.from(memoryStore.dreams.values())
            .filter((dream: any) => dream.userId === userId)
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            // .slice(0, 50); // Remove limit
        }
        
        if (dreams.length === 0) {
          return res.json({ 
            success: true, 
            profile: {
              userId,
              dreamThemes: [],
              emotionalTrends: [],
              profileSummary: '还没有足够的梦境记录来生成画像，记录更多梦境后即可查看您的心理画像。',
              archetypeDescription: '开始记录您的梦境，探索内心世界吧！'
            }
          });
        }
        
        const profileData = await dreamAnalysisService.generateUserProfile(
          dreams.map(d => ({
            content: d.content,
            analysis: d.analysis,
            createdAt: d.dream_date ? new Date(d.dream_date) : (d.created_at || d.createdAt)
          }))
        );
        
        try {
          const id = generateId();
          const dreamThemesJson = JSON.stringify(profileData.dreamThemes);
          const emotionalTrendsJson = JSON.stringify(profileData.emotionalTrends);
          const result = await query<any>(
            'insert into profiles (id, user_id, dream_themes, emotional_trends, profile_summary, archetype_description, created_at, updated_at) values ($1,$2,$3::jsonb,$4::jsonb,$5,$6, now(), now()) on conflict (user_id) do update set dream_themes = excluded.dream_themes, emotional_trends = excluded.emotional_trends, profile_summary = excluded.profile_summary, archetype_description = excluded.archetype_description, updated_at = now() returning *',
            [id, userId, dreamThemesJson, emotionalTrendsJson, profileData.profileSummary, profileData.archetypeDescription]
          );
          profile = mapProfileFromDb(result.rows[0]);
        } catch (dbError) {
          console.error('DB upsert profile failed:', (dbError as any)?.message || dbError);
          const id = generateId();
          profile = {
            _id: id,
            userId,
            ...profileData,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          memoryStore.profiles.set(userId, profile);
        }
      }
      
      res.json({ success: true, profile });
    } catch (error) {
      console.error('获取用户画像错误:', error);
      res.status(500).json({ success: false, error: '获取用户画像失败' });
    }
  },

  async refreshProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      let dreams = [];
      try {
        const result = await query<any>(
          'select content, analysis, dream_date, created_at from dreams where user_id = $1 order by dream_date desc nulls last, created_at desc',
          [userId]
        );
        dreams = result.rows;
      } catch (dbError) {
        dreams = Array.from(memoryStore.dreams.values())
          .filter((dream: any) => dream.userId === userId)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          // .slice(0, 50); // Remove limit
      }
      
      if (dreams.length === 0) {
        return res.json({ 
          success: true, 
          profile: {
            userId,
            dreamThemes: [],
            emotionalTrends: [],
            profileSummary: '还没有足够的梦境记录来生成画像。',
            archetypeDescription: '开始记录您的梦境吧！'
          }
        });
      }
      
      const profileData = await dreamAnalysisService.generateUserProfile(
        dreams.map(d => ({
          content: d.content,
          analysis: d.analysis,
          createdAt: d.dream_date ? new Date(d.dream_date) : (d.created_at || d.createdAt)
        }))
      );
      
      let profile;
      try {
        const dreamThemesJson = JSON.stringify(profileData.dreamThemes);
        const emotionalTrendsJson = JSON.stringify(profileData.emotionalTrends);
        const result = await query<any>(
          'insert into profiles (user_id, dream_themes, emotional_trends, profile_summary, archetype_description, created_at, updated_at) values ($1,$2::jsonb,$3::jsonb,$4,$5, now(), now()) on conflict (user_id) do update set dream_themes = excluded.dream_themes, emotional_trends = excluded.emotional_trends, profile_summary = excluded.profile_summary, archetype_description = excluded.archetype_description, updated_at = now() returning *',
          [userId, dreamThemesJson, emotionalTrendsJson, profileData.profileSummary, profileData.archetypeDescription]
        );
        profile = mapProfileFromDb(result.rows[0]);
      } catch (dbError) {
        console.error('DB refresh profile failed:', (dbError as any)?.message || dbError);
        const id = generateId();
        profile = {
          _id: id,
          userId,
          ...profileData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.profiles.set(userId, profile);
      }
      
      res.json({ success: true, profile });
    } catch (error) {
      console.error('刷新用户画像错误:', error);
      res.status(500).json({ success: false, error: '刷新用户画像失败' });
    }
  },

  async getEmotionalTrends(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { days = 30 } = req.query;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));
      
      let dreams = [];
      try {
        const result = await query<any>(
          'select dream_date, created_at, analysis from dreams where user_id = $1 and coalesce(dream_date::timestamp, created_at) >= $2 order by coalesce(dream_date::timestamp, created_at) asc',
          [userId, startDate]
        );
        dreams = result.rows;
      } catch (dbError) {
        dreams = Array.from(memoryStore.dreams.values())
          .filter((dream: any) => {
            const dreamDate = new Date(dream.createdAt);
            return dream.userId === userId && dreamDate >= startDate;
          })
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      
      const trends = dreams.map(dream => ({
        date: dream.dream_date || dream.created_at || dream.createdAt,
        happiness: 0,
        sadness: 0,
        anger: 0,
        fear: 0,
        disgust: 0,
        surprise: 0,
        // Map emotional state if available
        ...(dream.analysis?.emotionalState ? (() => {
          const mood = dream.analysis.emotionalState.mood?.toLowerCase() || '';
          const intensity = (dream.analysis.emotionalState.intensity || 5) / 10;
          return {
            happiness: mood.includes('快乐') || mood.includes('愉悦') || mood.includes('开心') || mood.includes('幸福') ? intensity : 0,
            sadness: mood.includes('悲伤') || mood.includes('忧郁') || mood.includes('难过') ? intensity : 0,
            anger: mood.includes('愤怒') || mood.includes('生气') || mood.includes('愠怒') ? intensity : 0,
            fear: mood.includes('恐惧') || mood.includes('害怕') ? intensity : 0,
            disgust: mood.includes('厌恶') || mood.includes('恶心') || mood.includes('反感') ? intensity : 0,
            surprise: mood.includes('惊讶') || mood.includes('震惊') || mood.includes('意外') ? intensity : 0
          };
        })() : {})
      }));
      
      res.json({ success: true, trends });
    } catch (error) {
      console.error('获取情绪趋势错误:', error);
      res.status(500).json({ success: false, error: '获取情绪趋势失败' });
    }
  }
};
