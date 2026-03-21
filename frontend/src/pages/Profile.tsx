import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, RefreshCw, Sparkles, TrendingUp, Moon, Star, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button, GlowCard, PageTransition } from '@/components/ui';
import { GalaxyThemes } from '@/components/GalaxyThemes';
import { useStore } from '@/store';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, fetchProfile, refreshProfile, isLoading, logout } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'trends'>('profile');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const userId = user.id || user._id;
      if (userId && !profile) { // Only fetch if profile is missing in store
        fetchProfile(userId);
      }
    }
  }, [user, profile, fetchProfile, navigate]);

  const handleRefresh = async () => {
    if (user) {
      const userId = user.id || user._id;
      if (userId) {
        await refreshProfile(userId);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const themeData = profile?.dreamThemes.map((t) => ({
    theme: t.theme,
    count: t.count,
  })) || [];

  const emotionData = profile?.emotionalTrends.slice(-7).reverse().map((t) => ({
    date: new Date(t.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    焦虑: t.anxiety,
    愉悦: t.joy,
    恐惧: t.fear,
    平静: t.peace,
    悲伤: t.sadness,
  })) || [];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto pb-6"> {/* Add padding-bottom */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <User className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">心理画像</h1>
              <p className="text-gray-400 text-sm">{user?.nickname} 的梦境分析</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-dream-card rounded-lg p-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'profile' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400'
                }`}
              >
                画像
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'trends' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400'
                }`}
              >
                趋势
              </button>
            </div>
            <Button variant="secondary" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              onClick={handleLogout}
              className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 ml-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </Button>
          </div>
        </div>

        {activeTab === 'profile' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <GlowCard hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">个人画像</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {profile?.profileSummary || '暂无画像数据，请先记录一些梦境'}
              </p>
            </GlowCard>

            <GlowCard hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">心理原型</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {profile?.archetypeDescription || '暂无原型分析'}
              </p>
            </GlowCard>

            <GlowCard hover={false} className="relative overflow-hidden w-full h-[500px]"> {/* Increased height */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-[#0a0a1a] to-black -z-10" />
              <div className="flex items-center gap-3 mb-4 relative z-10 p-6 pointer-events-none"> {/* Add padding and disable pointer events for title */}
                <Moon className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">梦境星系</h2>
              </div>
              
              <div className="absolute inset-0 z-0">
                {themeData.length > 0 ? (
                  <GalaxyThemes themes={themeData} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    暂无梦境主题数据
                  </div>
                )}
              </div>
            </GlowCard>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <GlowCard hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-white">情绪趋势</h2>
              </div>
              {emotionData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={emotionData}>
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 10, 26, 0.95)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '8px',
                        }}
                      />
                      <Line type="monotone" dataKey="焦虑" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
                      <Line type="monotone" dataKey="愉悦" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                      <Line type="monotone" dataKey="恐惧" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                      <Line type="monotone" dataKey="平静" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                      <Line type="monotone" dataKey="悲伤" stroke="#6b7280" strokeWidth={2} dot={{ fill: '#6b7280' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12">暂无情绪趋势数据</p>
              )}
            </GlowCard>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: '焦虑', color: 'purple', key: 'anxiety' as const },
                { label: '愉悦', color: 'green', key: 'joy' as const },
                { label: '恐惧', color: 'red', key: 'fear' as const },
                { label: '平静', color: 'blue', key: 'peace' as const },
                { label: '悲伤', color: 'gray', key: 'sadness' as const },
              ].map((emotion) => {
                const avg = profile?.emotionalTrends.length
                  ? profile.emotionalTrends.reduce((sum, t) => sum + (t[emotion.key] as number), 0) /
                    profile.emotionalTrends.length
                  : 0;
                return (
                  <GlowCard key={emotion.key} hover={false}>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-1">{emotion.label}</p>
                      <p className="text-2xl font-bold text-white">{avg.toFixed(1)}</p>
                      <p className="text-xs text-gray-500 mt-1">平均指数</p>
                    </div>
                  </GlowCard>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
