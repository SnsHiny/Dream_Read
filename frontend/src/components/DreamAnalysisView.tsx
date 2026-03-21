import { motion } from 'framer-motion';
import { Sparkles, Heart, Lightbulb, BookOpen, AlertCircle } from 'lucide-react';
import type { DreamAnalysis } from '@/types';
import { Tag, GlowCard } from './ui';

interface DreamAnalysisViewProps {
  analysis: DreamAnalysis;
}

export function DreamAnalysisView({ analysis }: DreamAnalysisViewProps) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GlowCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-gradient">核心象征解析</h3>
        </div>
        <div className="space-y-4">
          {analysis.coreSymbols.map((symbol, index) => (
            <motion.div
              key={symbol.symbol}
              className="p-4 rounded-xl bg-dream-deeper/50 border border-dream-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Tag color="purple">{symbol.symbol}</Tag>
              </div>
              <div className="space-y-3">
                {symbol.interpretations.map((interp, i) => (
                  <div key={i} className="pl-4 border-l-2 border-purple-500/30">
                    <p className="text-sm text-purple-300 mb-1">{interp.perspective}</p>
                    <p className="text-gray-300">{interp.meaning}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      📚 来源：{interp.source}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </GlowCard>

      <GlowCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-pink-400" />
          <h3 className="text-xl font-bold text-gradient">情绪与心理状态</h3>
        </div>
        <div className="p-4 rounded-xl bg-dream-deeper/50 border border-dream-border">
          <div className="flex items-center gap-3 mb-3">
            <Tag color="pink">{analysis.emotionalState.mood}</Tag>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">强度：</span>
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.emotionalState.intensity * 10}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <span className="text-sm text-purple-300">{analysis.emotionalState.intensity}/10</span>
            </div>
          </div>
          <p className="text-gray-300">{analysis.emotionalState.description}</p>
        </div>
      </GlowCard>

      <GlowCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-gradient">现实生活关联</h3>
        </div>
        <div className="space-y-3">
          {analysis.lifeConnection.map((connection, index) => (
            <motion.div
              key={index}
              className="p-4 rounded-xl bg-dream-deeper/50 border border-dream-border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Tag color="blue">{connection.aspect}</Tag>
              <p className="text-gray-300 mt-2">{connection.description}</p>
              <p className="text-sm text-gray-500 mt-1">相关程度：{connection.relevance}</p>
            </motion.div>
          ))}
        </div>
      </GlowCard>

      <GlowCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-gradient">思考建议</h3>
        </div>
        <ul className="space-y-2">
          {analysis.suggestions.map((suggestion, index) => (
            <motion.li
              key={index}
              className="flex items-start gap-2 text-gray-300"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-green-400 mt-1">•</span>
              <span>{suggestion}</span>
            </motion.li>
          ))}
        </ul>
      </GlowCard>

      <GlowCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-gradient">理论参考</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.theoreticalReferences.map((ref, index) => (
            <Tag key={index} color="blue">{ref}</Tag>
          ))}
        </div>
      </GlowCard>

      {analysis.warning && (
        <motion.div
          className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">{analysis.warning}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
