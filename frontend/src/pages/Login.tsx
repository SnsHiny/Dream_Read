import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button, GlowCard, PageTransition, StarBackground, FloatingMoon } from '@/components/ui';
import { useStore } from '@/store';
import { api } from '@/utils/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, setError, clearError } = useStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<'phone' | 'code'>('phone');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length !== 11) {
      setError('请输入正确的11位手机号');
      return;
    }
    
    clearError();
    try {
      await api.auth.sendCode(phoneNumber);
      setStep('code');
      setCountdown(60);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleLogin = async () => {
    if (!code || code.length !== 4) {
      setError('请输入4位验证码');
      return;
    }

    clearError();
    try {
      const user = await login(phoneNumber, code);
      // Check if user has required fields
      // Assuming nickname is a required field for onboarding
      if (!user.nickname) {
        navigate('/onboarding');
      } else {
        navigate('/dream');
      }
    } catch (err) {
      // Error is handled in store
    }
  };

  return (
    <PageTransition>
      <StarBackground />
      <FloatingMoon />
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-8 px-4 relative z-10">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              梦境解析
            </h1>
            <p className="text-gray-400">开启您的潜意识探索之旅</p>
          </motion.div>

          <GlowCard>
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm text-gray-400">手机号码</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="请输入手机号"
                    className="w-full bg-black/20 border border-purple-500/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {step === 'code' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <label className="block text-sm text-gray-400">验证码</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="请输入4位验证码" 
                      className="w-full bg-black/20 border border-purple-500/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      onClick={handleSendCode}
                      disabled={countdown > 0}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-purple-400 hover:text-purple-300 disabled:text-gray-600 disabled:cursor-not-allowed px-2 py-1"
                    >
                      {countdown > 0 ? `${countdown}s后重发` : '重新发送'}
                    </button>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button
                onClick={step === 'phone' ? handleSendCode : handleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : step === 'phone' ? (
                  <>
                    获取验证码 <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  '进入梦境'
                )}
              </Button>
            </div>
          </GlowCard>
        </div>
      </div>
    </PageTransition>
  );
}
