import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Moon, Sparkles, BookOpen, Brain, ArrowRight, Settings } from 'lucide-react';
import { Button, GlowCard, StarBackground, FloatingMoon } from '@/components/ui';
import { useStore } from '@/store';
import { UserInfoEditModal } from '@/components/UserInfoEditModal';
import { useState } from 'react';

export function HomePage() {
  const { user, createUser, isLoading } = useStore();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const features = [
    {
      icon: Brain,
      title: '专业解析',
      description: '融合弗洛伊德、荣格心理学与中国传统解梦理论',
    },
    {
      icon: Moon,
      title: '语音输入',
      description: '支持语音描述梦境，自动转文字进行解析',
    },
    {
      icon: BookOpen,
      title: '梦境日记',
      description: '记录所有梦境，追踪情绪变化与主题趋势',
    },
    {
      icon: Sparkles,
      title: '心理画像',
      description: '基于梦境历史生成个人心理画像分析',
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <StarBackground />
      <FloatingMoon />
      
      <div className="relative z-10">
        <motion.div
          className="text-center py-12 md:py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center mb-6"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Moon className="w-20 h-20 md:w-28 md:h-28 text-purple-400" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">探索梦境的奥秘</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 px-4">
            基于中西方权威梦境理论，为您深度解析每一个梦境符号背后的心理意义
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="primary" 
              className="flex items-center gap-2"
              onClick={() => {
                if (user) {
                  if (!user.nickname) {
                    navigate('/onboarding');
                  } else {
                    navigate('/dream');
                  }
                } else {
                  navigate('/login');
                }
              }}
            >
              <span>开始探索</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="secondary"
              onClick={() => {
                if (user) {
                  navigate('/history');
                } else {
                  navigate('/login');
                }
              }}
            >
              查看记录
            </Button>

            {user && user.nickname && (
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => setIsEditOpen(true)}
              >
                <Settings className="w-4 h-4" />
                修改信息
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <GlowCard className="h-full">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <feature.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <GlowCard className="inline-block" hover={false}>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>隐私保护：您的梦境数据仅用于解析，严格加密存储</span>
            </div>
          </GlowCard>
        </motion.div>
      </div>

      {user && (
        <UserInfoEditModal
          isOpen={isEditOpen}
          user={user}
          isSaving={isLoading}
          onClose={() => setIsEditOpen(false)}
          onSave={async (data) => {
            await createUser(data);
          }}
        />
      )}
    </div>
  );
}
