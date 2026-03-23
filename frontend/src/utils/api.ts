const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    // Handle empty response (e.g. 204 No Content) or non-JSON responses gracefully
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok || (data && data.success === false)) {
      throw new Error(data.error || `请求失败: ${response.status} ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export const api = {
  auth: {
    sendCode: (phoneNumber: string) =>
      fetchApi<{ success: boolean; message: string }>('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      }),
    
    login: (phoneNumber: string, code: string) =>
      fetchApi<{ success: boolean; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, code }),
      }),
  },

  user: {
    create: (userData: Partial<User>) => 
      fetchApi<{ success: boolean; user: User }>('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    
    get: (userId: string) => 
      fetchApi<{ success: boolean; user: User }>(`/users/${userId}`),
  },

  dream: {
    create: (data: { userId: string; content: string; inputType?: 'text' | 'voice'; mood?: string; dreamDate?: string }) =>
      fetchApi<{ success: boolean; dream: Dream }>('/dreams', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    list: (userId: string, page = 1, limit = 10, search?: string) => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append('search', search);
      return fetchApi<PaginatedResponse<Dream>>(`/dreams/${userId}?${params}`);
    },
    
    get: (dreamId: string) =>
      fetchApi<{ success: boolean; dream: Dream }>(`/dream/detail/${dreamId}`),
    
    delete: (dreamId: string) =>
      fetchApi<{ success: boolean; message: string }>(`/dreams/${dreamId}`, {
        method: 'DELETE',
      }),
  },

  profile: {
    get: (userId: string) =>
      fetchApi<{ success: boolean; profile: UserProfile }>(`/profile/${userId}`),
    
    refresh: (userId: string) =>
      fetchApi<{ success: boolean; profile: UserProfile }>(`/profile/${userId}/refresh`, {
        method: 'POST',
      }),
    
    getTrends: (userId: string, days = 30) =>
      fetchApi<{ success: boolean; trends: EmotionalTrend[] }>(`/profile/${userId}/trends?days=${days}`),
  },
};

import type { User, Dream, UserProfile, EmotionalTrend, PaginatedResponse } from '@/types';
