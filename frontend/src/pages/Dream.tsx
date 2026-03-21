import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Send, Sparkles, AlertCircle } from 'lucide-react';
import { Button, GlowCard, PageTransition } from '@/components/ui';
import { VoiceInput } from '@/components/VoiceInput';
import { DreamAnalysisView } from '@/components/DreamAnalysisView';
import { useStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import type { Dream } from '@/types';

function DreamLoadingAnimation({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  
  const stages = [
    "连接潜意识深处...",
    "正在解读梦境符号...",
    "分析情绪波动...",
    "构建心理画像...",
    "即将揭晓梦的启示..."
  ];

  useEffect(() => {
    // 增加到 180秒 (3分钟)，与后端超时匹配
    const totalDuration = 180000; 
    const interval = 100;
    const steps = totalDuration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 99) {
          // 停在 99%，直到 onComplete 被调用
          return 99;
        }
        
        // Update stage based on progress
        const currentStage = Math.floor((next / 100) * stages.length);
        setStage(Math.min(currentStage, stages.length - 1));
        
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  // 当 onComplete 被调用时（即数据返回时），瞬间完成进度条
  useEffect(() => {
    // 这里的逻辑其实不需要额外写，因为父组件会在 isLoading 变为 false 时卸载此组件
    // 但为了动画平滑，可以考虑在父组件做一点延迟卸载，不过目前这样直接卸载也是合理的
  }, []);

  const quotes = [
    { text: "梦是通往潜意识的皇室大道。", author: "西格蒙德·弗洛伊德" },
    { text: "未被表达的情绪永远不会消亡，它们只是被活埋，并将在未来以更丑陋的方式涌现。", author: "西格蒙德·弗洛伊德" },
    { text: "向外看的人在做梦，向内看的人在觉醒。", author: "卡尔·荣格" },
    { text: "梦是潜意识在意识层面的自我告白。", author: "卡尔·荣格" },
    { text: "至人无梦。", author: "《庄子》" },
    { text: "庄周梦蝶，不知周之梦为蝴蝶与，蝴蝶之梦为周与？", author: "《庄子》" },
    { text: "梦者，情之所钟，气之所感。", author: "《梦林玄解》" }
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % quotes.length);
    }, 6000); // 每6秒切换一次名言
    return () => clearInterval(quoteTimer);
  }, []);

  const starField = useState(() => {
    const cols = 18;
    const rows = 10;
    const stars: Array<{ x: number; y: number; size: number; duration: number; delay: number; opacity: number; layer: 1 | 2 }> = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = ((c + 0.5) / cols) * 100 + (Math.random() - 0.5) * 2.2;
        const y = ((r + 0.5) / rows) * 100 + (Math.random() - 0.5) * 2.2;
        const layer: 1 | 2 = Math.random() > 0.55 ? 1 : 2;
        const size = layer === 1 ? 1 + Math.random() * 2.2 : 0.8 + Math.random() * 1.6;
        const duration = 1.8 + Math.random() * 3.2;
        const delay = Math.random() * 2.5;
        const opacity = 0.25 + Math.random() * 0.6;
        stars.push({ x, y, size, duration, delay, opacity, layer });
      }
    }

    return stars;
  })[0];

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background Effects - Immersive Dream Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Nebulas */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Galaxy Starfield */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360, scale: [1, 1.03, 1] }}
          transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50% 50%' }}
        >
          {starField
            .filter((s) => s.layer === 2)
            .map((s, i) => (
              <motion.div
                key={`star-back-${i}`}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: s.size,
                  height: s.size,
                  opacity: s.opacity,
                  filter: 'blur(0.6px) drop-shadow(0 0 6px rgba(255,255,255,0.22))',
                }}
                animate={{
                  opacity: [s.opacity * 0.25, s.opacity, s.opacity * 0.35],
                  scale: [1, 1.25, 1],
                }}
                transition={{
                  duration: s.duration,
                  delay: s.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
        </motion.div>
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: -360 }}
          transition={{ duration: 210, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50% 50%' }}
        >
          {starField
            .filter((s) => s.layer === 1)
            .map((s, i) => (
              <motion.div
                key={`star-front-${i}`}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: s.size,
                  height: s.size,
                  opacity: s.opacity,
                  filter: 'blur(0.2px) drop-shadow(0 0 10px rgba(255,255,255,0.35))',
                }}
                animate={{
                  opacity: [s.opacity * 0.15, s.opacity, s.opacity * 0.25],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: s.duration * 0.9,
                  delay: s.delay * 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
        </motion.div>
      </div>

      {/* Central Animation - Hollow/Fate Theme */}
      <div className="relative z-10 mb-12">
        <motion.div
          className="relative w-48 h-48 flex items-center justify-center"
        >
          {/* Rotating Rings */}
          <motion.div
            className="absolute inset-0 border-[1px] border-purple-500/20 rounded-full"
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 border-[1px] border-indigo-500/20 rounded-full border-dashed"
            animate={{ rotate: -360, scale: [1, 0.95, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-8 border-[1px] border-pink-500/20 rounded-full"
            animate={{ rotate: 180 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Core Symbol - Hollow Moon */}
          <motion.div 
            className="relative z-20"
            animate={{ 
              scale: [1, 1.1, 1],
              filter: ['drop-shadow(0 0 10px rgba(168,85,247,0.3))', 'drop-shadow(0 0 25px rgba(168,85,247,0.6))', 'drop-shadow(0 0 10px rgba(168,85,247,0.3))']
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Moon className="w-20 h-20 text-white/90" strokeWidth={1} />
          </motion.div>

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r="90"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="1.5"
              strokeDasharray="565"
              strokeDashoffset={565 - (565 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* Text Info - Fate/Destiny Style */}
      <div className="relative z-10 text-center space-y-8 max-w-2xl px-4 flex flex-col items-center">
        <motion.div
          key={stage}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-3xl font-light tracking-widest text-white/90 font-serif">
            {stages[stage]}
          </h3>
        </motion.div>
        
        {/* Progress Bar & Time */}
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <div className="h-[1px] w-full bg-purple-900/30 relative overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent w-full"
              style={{ x: `${progress - 100}%` }}
            />
          </div>
          <p className="text-purple-200/40 text-xs tracking-widest font-mono uppercase">
            ANALYZING... {progress.toFixed(0)}%
          </p>
          <p className="text-purple-300/30 text-[10px] tracking-wide mt-1">
            梦境分析时间较长，请耐心等待...
          </p>
        </div>

        {/* Floating Quotes - Immersive & Philosophical */}
        <div className="h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="text-center"
            >
              <p className="text-lg text-purple-100/80 font-serif italic mb-2 tracking-wide leading-relaxed">
                "{quotes[currentQuote].text}"
              </p>
              <p className="text-sm text-purple-300/50 font-light">
                —— {quotes[currentQuote].author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function DreamPage() {
  const navigate = useNavigate();
  const { user, createDream, isLoading, error, clearError } = useStore();
  const [dreamContent, setDreamContent] = useState('');
  const [currentDream, setCurrentDream] = useState<Dream | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    if (!dreamContent.trim()) return;
    
    clearError();
    try {
      const dream = await createDream({ 
        content: dreamContent.trim(),
        inputType: 'text'
      });
      setCurrentDream(dream);
      setShowAnalysis(true);
    } catch (err) {
      console.error('解析失败:', err);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setDreamContent((prev) => prev + text);
  };

  const handleNewDream = () => {
    setDreamContent('');
    setCurrentDream(null);
    setShowAnalysis(false);
  };

  const promptSuggestions = [
    '我梦见自己在飞翔...',
    '梦见被追赶却跑不动...',
    '梦见已故的亲人...',
    '梦见掉牙齿...',
    '梦见水/游泳/溺水...',
    '梦见考试...',
  ];

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!showAnalysis ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  className="inline-flex items-center justify-center mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Moon className="w-12 h-12 text-purple-400" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gradient mb-2">描述您的梦境</h1>
                <p className="text-gray-400">越详细，解析越准确</p>
              </div>

              <GlowCard className="mb-6" hover={false}>
                <textarea
                  value={dreamContent}
                  onChange={(e) => setDreamContent(e.target.value)}
                  placeholder="描述您的梦境，包括场景、人物、情绪、颜色等细节..."
                  className="w-full h-48 bg-transparent border-none outline-none resize-none text-lg text-white placeholder-gray-500"
                />
                
                <div className="flex items-center justify-between pt-4 border-t border-dream-border">
                  <VoiceInput onTranscript={handleVoiceTranscript} />
                  
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!dreamContent.trim() || isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span>解析中...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>开始解析</span>
                      </>
                    )}
                  </Button>
                </div>
              </GlowCard>

              {error && (
                <motion.div
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}

              {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  <DreamLoadingAnimation />
                </div>
              )}

              {!isLoading && (
                <div className="mb-8">
                  <p className="text-sm text-gray-500 mb-3">常见梦境主题：</p>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setDreamContent(suggestion)}
                        className="px-3 py-1.5 rounded-full text-sm bg-dream-card border border-dream-border text-gray-400 hover:text-purple-300 hover:border-purple-500/50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isLoading && (
                <GlowCard hover={false} className="bg-purple-500/5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-400">
                      <p className="font-medium text-purple-300 mb-1">解析说明</p>
                      <p>
                        我们的解析融合了弗洛伊德精神分析、荣格分析心理学以及中国传统解梦理论，
                        为您提供多角度、深层次的梦境解读。
                      </p>
                    </div>
                  </div>
                </GlowCard>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {currentDream?.analysis ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gradient">解析结果</h2>
                    <Button variant="secondary" onClick={handleNewDream}>
                      解析新梦境
                    </Button>
                  </div>

                  <GlowCard className="mb-6" hover={false}>
                    <p className="text-gray-400 text-sm mb-2">您的梦境：</p>
                    <p className="text-white">{currentDream.content}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {currentDream.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </GlowCard>

                  <DreamAnalysisView analysis={currentDream.analysis} />
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
