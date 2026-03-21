import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, Briefcase, Target, Brain, ArrowRight, ArrowLeft, Moon } from 'lucide-react';
import { Button, GlowCard, PageTransition } from '@/components/ui';
import { useStore } from '@/store';

interface SelectOption {
  value: string;
  label: string;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
}

interface FormStep {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FormField[];
}

const steps: FormStep[] = [
  {
    id: 'basic',
    title: '基本信息',
    icon: User,
    fields: [
      { name: 'nickname', label: '昵称', type: 'text', placeholder: '请输入您的昵称', required: true },
      { name: 'gender', label: '性别', type: 'select', options: [
        { value: 'male', label: '男' },
        { value: 'female', label: '女' },
        { value: 'other', label: '其他' },
      ], required: true },
      { name: 'age', label: '年龄', type: 'number', placeholder: '请输入年龄', required: true },
    ],
  },
  {
    id: 'sleep',
    title: '睡眠与梦境',
    icon: Moon,
    fields: [
      { name: 'sleepQuality', label: '睡眠质量', type: 'radio', options: [
        { value: 'good', label: '很好' },
        { value: 'average', label: '一般' },
        { value: 'poor', label: '较差' },
        { value: 'insomnia', label: '失眠' },
      ], required: true },
      { name: 'dreamFrequency', label: '做梦频率', type: 'radio', options: [
        { value: 'every_night', label: '每晚' },
        { value: 'often', label: '经常' },
        { value: 'sometimes', label: '偶尔' },
        { value: 'rarely', label: '很少' },
      ], required: true },
    ],
  },
  {
    id: 'mental',
    title: '心理状态',
    icon: Brain,
    fields: [
      { name: 'stressLevel', label: '压力程度', type: 'radio', options: [
        { value: 'low', label: '低' },
        { value: 'medium', label: '中' },
        { value: 'high', label: '高' },
      ], required: true },
      { name: 'recentMood', label: '近期心情', type: 'select', options: [
        { value: 'calm', label: '平静' },
        { value: 'happy', label: '快乐' },
        { value: 'anxious', label: '焦虑' },
        { value: 'depressed', label: '低落' },
        { value: 'confused', label: '迷茫' },
        { value: 'angry', label: '愤怒' },
      ], required: true },
    ],
  },
  {
    id: 'context',
    title: '生活背景',
    icon: Briefcase,
    fields: [
      { name: 'occupation', label: '职业', type: 'text', placeholder: '请输入您的职业' },
      { name: 'familyEnvironment', label: '家庭环境', type: 'textarea', placeholder: '简单描述您的家庭环境' },
    ],
  },
  {
    id: 'goals',
    title: '个人理想',
    icon: Target,
    fields: [
      { name: 'personalGoals', label: '个人理想', type: 'textarea', placeholder: '描述您的人生目标或近期愿望' },
    ],
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { createUser, isLoading, user } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({
    nickname: user?.nickname || '',
    gender: user?.gender || '',
    age: user?.age ? String(user.age) : '',
    occupation: user?.occupation || '',
    familyEnvironment: user?.familyEnvironment || '',
    personalGoals: user?.personalGoals || '',
    psychologicalStatus: user?.psychologicalStatus || '',
    sleepQuality: '',
    stressLevel: '',
    recentMood: '',
    dreamFrequency: '',
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const canProceed = () => {
    const currentFields = steps[currentStep].fields;
    return currentFields.every((field) => {
      if (!field.required) return true;
      return formData[field.name]?.trim() !== '';
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await createUser({
        nickname: formData.nickname,
        gender: formData.gender as 'male' | 'female' | 'other',
        age: parseInt(formData.age),
        occupation: formData.occupation,
        familyEnvironment: formData.familyEnvironment,
        personalGoals: formData.personalGoals,
        psychologicalStatus: formData.psychologicalStatus,
        sleepQuality: formData.sleepQuality,
        stressLevel: formData.stressLevel,
        recentMood: formData.recentMood,
        dreamFrequency: formData.dreamFrequency,
      });
      navigate('/dream');
    } catch (error) {
      console.error('创建用户失败:', error);
    }
  };

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400 w-8'
                      : index < currentStep
                      ? 'bg-purple-600 w-2'
                      : 'bg-gray-700 w-2'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-gray-400 text-sm">
              步骤 {currentStep + 1} / {steps.length}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlowCard hover={false}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <StepIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                </div>

                <div className="space-y-6">
                  {step.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm text-gray-400 mb-3">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'radio' ? (
                        <div className="grid grid-cols-2 gap-3">
                          {field.options?.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleInputChange(field.name, opt.value)}
                              className={`p-3 rounded-xl border transition-all text-sm font-medium ${
                                formData[field.name] === opt.value
                                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                  : 'bg-black/20 border-purple-500/10 text-gray-400 hover:border-purple-500/30 hover:bg-purple-500/5'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : field.type === 'select' ? (
                        <div className="relative">
                          <select
                            value={formData[field.name]}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full bg-black/20 border border-purple-500/20 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:border-purple-500 transition-colors"
                          >
                            <option value="" disabled>请选择</option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value} className="bg-gray-900">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.name]}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full bg-black/20 border border-purple-500/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.name]}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-black/20 border border-purple-500/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
                  <Button
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>上一步</span>
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="flex items-center gap-2"
                    >
                      <span>下一步</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{isLoading ? '保存中...' : '开始解梦'}</span>
                    </Button>
                  )}
                </div>
              </GlowCard>
            </motion.div>
          </AnimatePresence>

          <p className="text-center text-gray-500 text-sm mt-6">
            信息越完善，AI 解梦越精准
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
