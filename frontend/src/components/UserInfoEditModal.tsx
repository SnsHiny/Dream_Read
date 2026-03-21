import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui';
import type { User } from '@/types';

type EditableUserFields = Pick<
  User,
  'occupation' | 'familyEnvironment' | 'personalGoals' | 'sleepQuality' | 'stressLevel' | 'dreamFrequency' | 'psychologicalStatus'
>;

export function UserInfoEditModal({
  isOpen,
  user,
  onClose,
  onSave,
  isSaving,
}: {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSave: (data: Partial<EditableUserFields>) => Promise<void>;
  isSaving?: boolean;
}) {
  const initial = useMemo(
    () => ({
      occupation: user.occupation || '',
      familyEnvironment: user.familyEnvironment || '',
      personalGoals: user.personalGoals || '',
      sleepQuality: user.sleepQuality || '',
      stressLevel: user.stressLevel || '',
      dreamFrequency: user.dreamFrequency || '',
      psychologicalStatus: user.psychologicalStatus || '',
    }),
    [user]
  );

  const [formData, setFormData] = useState(initial);

  useEffect(() => {
    if (isOpen) setFormData(initial);
  }, [isOpen, initial]);

  const update = (key: keyof EditableUserFields, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await onSave({
      occupation: formData.occupation,
      familyEnvironment: formData.familyEnvironment,
      personalGoals: formData.personalGoals,
      sleepQuality: formData.sleepQuality,
      stressLevel: formData.stressLevel,
      dreamFrequency: formData.dreamFrequency,
      psychologicalStatus: formData.psychologicalStatus,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="relative z-10 min-h-[100dvh] flex items-end sm:items-center justify-center p-4 py-6">
            <motion.div
              className="w-full max-w-lg bg-[#1a1625] border border-purple-500/20 rounded-2xl shadow-xl overflow-hidden max-h-[calc(100dvh-3rem)] flex flex-col"
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-5 sm:p-6 border-b border-purple-500/10 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">更新个人信息</h3>
                  <p className="text-gray-400 text-sm mt-1">这些信息会影响后续的梦境解读。</p>
                </div>
                <Button variant="ghost" className="px-3" onClick={onClose}>
                  关闭
                </Button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">职业</label>
                <input
                  className="input-field"
                  value={formData.occupation}
                  onChange={(e) => update('occupation', e.target.value)}
                  placeholder="例如：产品经理 / 学生 / 自由职业"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">做梦频率</label>
                <select
                  className="input-field appearance-none"
                  value={formData.dreamFrequency}
                  onChange={(e) => update('dreamFrequency', e.target.value)}
                >
                  <option value="">请选择</option>
                  <option value="every_night">每晚</option>
                  <option value="often">经常</option>
                  <option value="sometimes">偶尔</option>
                  <option value="rarely">很少</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">睡眠质量</label>
                <select
                  className="input-field appearance-none"
                  value={formData.sleepQuality}
                  onChange={(e) => update('sleepQuality', e.target.value)}
                >
                  <option value="">请选择</option>
                  <option value="good">很好</option>
                  <option value="average">一般</option>
                  <option value="poor">较差</option>
                  <option value="insomnia">失眠</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">压力程度</label>
                <select
                  className="input-field appearance-none"
                  value={formData.stressLevel}
                  onChange={(e) => update('stressLevel', e.target.value)}
                >
                  <option value="">请选择</option>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-2">家庭关系</label>
                <textarea
                  className="input-field min-h-[88px]"
                  value={formData.familyEnvironment}
                  onChange={(e) => update('familyEnvironment', e.target.value)}
                  placeholder="例如：与父母关系、家庭氛围、近期家庭事件"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-2">理想 / 目标</label>
                <textarea
                  className="input-field min-h-[88px]"
                  value={formData.personalGoals}
                  onChange={(e) => update('personalGoals', e.target.value)}
                  placeholder="例如：近期想完成的事、长期追求、困扰与期待"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-2">心理状态</label>
                <textarea
                  className="input-field min-h-[88px]"
                  value={formData.psychologicalStatus}
                  onChange={(e) => update('psychologicalStatus', e.target.value)}
                  placeholder="例如：焦虑/平静/迷茫等，近期主要感受"
                />
              </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 border-t border-purple-500/10 flex justify-end gap-3 bg-[#1a1625]">
                <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                  取消
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                  保存
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
