import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, RefreshCw, Sparkles, TrendingUp, Moon, Star, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Button, GlowCard, PageTransition } from '@/components/ui';
import { GalaxyThemes } from '@/components/GalaxyThemes';
import { useStore } from '@/store';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, fetchProfile, refreshProfile, isLoading, logout } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'trends'>('profile');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });

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

  const monthOptions = useMemo(() => {
    const trends = profile?.emotionalTrends || [];
    const months = new Set<string>();
    for (const t of trends) {
      const d = new Date(t.date);
      if (isNaN(d.getTime())) continue;
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.add(ym);
    }
    const sorted = Array.from(months).sort().reverse();
    return sorted.length ? sorted : [selectedMonth];
  }, [profile?.emotionalTrends, selectedMonth]);

  useEffect(() => {
    if (!monthOptions.includes(selectedMonth)) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [monthOptions, selectedMonth]);

  const emotionData = useMemo(() => {
    const trends = profile?.emotionalTrends || [];
    const dailyMap = new Map<
      string,
      {
        key: string;
        day: string;
        date: Date;
        count: number;
        sadness: number;
        happiness: number;
        anger: number;
        fear: number;
        disgust: number;
        surprise: number;
      }
    >();

    for (const t of trends) {
      const d = new Date(t.date);
      if (isNaN(d.getTime())) continue;
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (ym !== selectedMonth) continue;

      const dayNum = String(d.getDate()).padStart(2, '0');
      const key = `${ym}-${dayNum}`;
      const existing = dailyMap.get(key) || {
        key,
        day: dayNum,
        date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        count: 0,
        sadness: 0,
        happiness: 0,
        anger: 0,
        fear: 0,
        disgust: 0,
        surprise: 0,
      };

      existing.count += 1;
      const anyT = t as any;
      existing.happiness += Number(anyT.happiness ?? anyT.joy ?? 0);
      existing.sadness += Number(anyT.sadness ?? 0);
      existing.anger += Number(anyT.anger ?? 0);
      existing.fear += Number(anyT.fear ?? 0);
      existing.disgust += Number(anyT.disgust ?? 0);
      existing.surprise += Number(anyT.surprise ?? 0);

      dailyMap.set(key, existing);
    }

    const rows = Array.from(dailyMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((r) => {
        const scale = (v: number) => Math.round((v / Math.max(1, r.count)) * 100);
        return {
          dateLabel: `${selectedMonth}-${r.day}`,
          day: `${Number(r.day)}日`,
          快乐: scale(r.happiness),
          悲伤: scale(r.sadness),
          愤怒: scale(r.anger),
          恐惧: scale(r.fear),
          厌恶: scale(r.disgust),
          惊讶: scale(r.surprise),
        };
      });

    return rows;
  }, [profile?.emotionalTrends, selectedMonth]);

  const xTicks = useMemo(() => {
    if (emotionData.length <= 8) return emotionData.map((d) => d.day);
    const step = Math.ceil(emotionData.length / 7);
    const ticks: string[] = [];
    for (let i = 0; i < emotionData.length; i += step) {
      ticks.push(emotionData[i].day);
    }
    const last = emotionData[emotionData.length - 1].day;
    if (ticks[ticks.length - 1] !== last) ticks.push(last);
    return ticks;
  }, [emotionData]);

  const radarData = useMemo(() => {
    if (!emotionData.length) {
      return [
        { emotion: '快乐', value: 0 },
        { emotion: '悲伤', value: 0 },
        { emotion: '愤怒', value: 0 },
        { emotion: '恐惧', value: 0 },
        { emotion: '厌恶', value: 0 },
        { emotion: '惊讶', value: 0 },
      ];
    }

    const sum = {
      快乐: 0,
      悲伤: 0,
      愤怒: 0,
      恐惧: 0,
      厌恶: 0,
      惊讶: 0,
    } as Record<string, number>;

    for (const d of emotionData as any[]) {
      sum.快乐 += Number(d.快乐 || 0);
      sum.悲伤 += Number(d.悲伤 || 0);
      sum.愤怒 += Number(d.愤怒 || 0);
      sum.恐惧 += Number(d.恐惧 || 0);
      sum.厌恶 += Number(d.厌恶 || 0);
      sum.惊讶 += Number(d.惊讶 || 0);
    }

    const n = Math.max(1, emotionData.length);
    const avg = (v: number) => Math.round(v / n);

    return [
      { emotion: '快乐', value: avg(sum.快乐) },
      { emotion: '悲伤', value: avg(sum.悲伤) },
      { emotion: '愤怒', value: avg(sum.愤怒) },
      { emotion: '恐惧', value: avg(sum.恐惧) },
      { emotion: '厌恶', value: avg(sum.厌恶) },
      { emotion: '惊讶', value: avg(sum.惊讶) },
    ];
  }, [emotionData]);

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">月份</span>
                  <input
                    type="month"
                    className="input-field w-[160px]"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    min={monthOptions[monthOptions.length - 1]}
                    max={monthOptions[0]}
                  />
                </div>
              </div>
              {emotionData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={emotionData}>
                      <XAxis 
                        dataKey="day" 
                        stroke="#6b7280"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        ticks={xTicks}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 10, 26, 0.95)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: any) => [`${Number(value).toFixed(0)} D`, '梦辉值']}
                        labelFormatter={(label: any) => `${selectedMonth}-${String(label).replace('日', '').padStart(2, '0')} 日`}
                      />
                      <Line type="monotone" dataKey="快乐" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                      <Line type="monotone" dataKey="悲伤" stroke="#6b7280" strokeWidth={2} dot={{ fill: '#6b7280' }} />
                      <Line type="monotone" dataKey="愤怒" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                      <Line type="monotone" dataKey="恐惧" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                      <Line type="monotone" dataKey="厌恶" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                      <Line type="monotone" dataKey="惊讶" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12">暂无情绪趋势数据</p>
              )}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlowCard hover={false}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-medium">Ekman 六种基本情绪</p>
                    <p className="text-xs text-gray-500">单位：D</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid gridType="polygon" stroke="rgba(139, 92, 246, 0.25)" />
                        <PolarAngleAxis dataKey="emotion" tick={{ fill: '#c7c9d1', fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} tickCount={5} />
                        <Radar
                          dataKey="value"
                          stroke="#a855f7"
                          fill="rgba(168, 85, 247, 0.25)"
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </GlowCard>

                <div className="p-4 rounded-xl bg-dream-deeper/40 border border-purple-500/10">
                  <p className="text-white font-medium mb-2">计量规则（单位：D）</p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>D 在 0–100 之间流动。</p>
                    <p>数值越高，越接近梦境的核心回声。</p>
                    <p>六种情绪彼此独立，互不抵消。</p>
                  </div>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
