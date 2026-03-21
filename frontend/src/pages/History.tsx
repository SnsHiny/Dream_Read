import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, Trash2, Eye, Moon, Mic } from 'lucide-react';
import { Button, GlowCard, PageTransition, Tag, Modal } from '@/components/ui';
import { DreamAnalysisView } from '@/components/DreamAnalysisView';
import { useStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import type { Dream } from '@/types';

export function HistoryPage() {
  const navigate = useNavigate();
  const { user, dreams, fetchDreams, deleteDream, isLoading } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [page, setPage] = useState(1);
  const isFetchingRef = useRef(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const userId = (user as any).id || (user as any)._id;
      if (userId && !isFetchingRef.current) {
        isFetchingRef.current = true;
        // Immediate fetch, no debounce
        fetchDreams(userId, page, searchQuery)
          .finally(() => {
            isFetchingRef.current = false;
          });
      }
    }
  }, [user, page, searchQuery, fetchDreams, navigate]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleDeleteClick = (dreamId: string) => {
    setDeleteConfirmId(dreamId);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteDream(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const getDreamDate = (dream: any) => dream.created_at || dream.createdAt;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知时间';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return '无效日期';
      
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return '日期错误';
    }
  };

  const filteredDreams = dreams.filter((dream) =>
    dream.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dream.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gradient">梦境日记</h1>
            <p className="text-gray-400 text-sm mt-1">共 {dreams.length} 条记录</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索梦境..."
              className="input-field pl-10 w-full md:w-64"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedDream ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => setSelectedDream(null)}>
                  ← 返回列表
                </Button>
              </div>

              <GlowCard className="mb-6" hover={false}>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(getDreamDate(selectedDream))}</span>
                </div>
                <p className="text-white text-lg">{selectedDream.content}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedDream.tags.map((tag, i) => (
                    <Tag key={`${selectedDream.id}-detail-tag-${i}`}>{tag}</Tag>
                  ))}
                </div>
              </GlowCard>

              {selectedDream.analysis && (
                <DreamAnalysisView analysis={selectedDream.analysis} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isLoading ? (
                <div className="text-center py-12">
                  <Moon className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-400">加载中...</p>
                </div>
              ) : filteredDreams.length === 0 ? (
                <GlowCard className="text-center py-12" hover={false}>
                  <Moon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    {searchQuery ? '没有找到匹配的梦境' : '还没有记录任何梦境'}
                  </p>
                  {!searchQuery && (
                    <Button variant="primary" onClick={() => navigate('/dream')}>
                      记录第一个梦境
                    </Button>
                  )}
                </GlowCard>
              ) : (
                <div className="space-y-4">
                  {filteredDreams.map((dream, index) => (
                    <motion.div
                      key={dream.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlowCard className="group relative overflow-hidden">
                        <div className="relative z-10 pr-16">
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(getDreamDate(dream))}</span>
                            {(dream.inputType === 'voice' || dream.input_type === 'voice') && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300 flex items-center gap-1">
                                <Mic className="w-3 h-3" />
                                语音输入
                              </span>
                            )}
                          </div>
                          <p className="text-white line-clamp-2 mb-3">{dream.content}</p>
                          <div className="flex flex-wrap gap-2">
                            {(dream.tags || []).slice(0, 5).map((tag, i) => (
                              <Tag key={`${dream.id}-tag-${i}`} color="purple">{tag}</Tag>
                            ))}
                            {(dream.tags || []).length > 5 && (
                              <span className="text-xs text-gray-500">
                                +{(dream.tags || []).length - 5}
                              </span>
                            )}
                          </div>
                          {dream.analysis?.emotionalState && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-sm text-gray-500">情绪：</span>
                              <Tag color="pink">{dream.analysis.emotionalState.mood}</Tag>
                            </div>
                          )}
                        </div>

                        <div
                          className="absolute top-4 right-4 z-20 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" onClick={() => setSelectedDream(dream)} className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteClick(dream.id || (dream as any)._id)}
                            className="p-2 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <button className="absolute inset-0 z-0 md:hidden" onClick={() => setSelectedDream(dream)} />
                      </GlowCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="删除梦境"
          description="确定要删除这条梦境记录吗？此操作无法撤销。"
          confirmText="删除"
          isDestructive
          onConfirm={handleConfirmDelete}
        />
      </div>
    </PageTransition>
  );
}
