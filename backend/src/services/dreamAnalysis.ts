import { callVolcAI as callVolcApi } from '../utils/volc';

interface SymbolInterpretation {
  source: string;
}

interface CoreSymbol {
  symbol: string;
  interpretations: SymbolInterpretation[];
}

interface EmotionalState {
  mood: string;
  description: string;
  intensity: number;
}

interface LifeConnection {
  aspect: string;
  description: string;
  relevance: string;
}

interface DreamAnalysis {
  coreSymbols: CoreSymbol[];
  emotionalState: EmotionalState;
  lifeConnection: LifeConnection[];
  suggestions: string[];
  theoreticalReferences: string[];
  overallTone: string;
  warning?: string;
}

interface UserInfo {
  nickname?: string;
  gender?: string;
  age?: number;
  occupation?: string;
  familyEnvironment?: string;
  personalGoals?: string;
  psychologicalStatus?: string;
  sleepQuality?: string;
  stressLevel?: string;
  recentMood?: string;
  dreamFrequency?: string;
}

const SYSTEM_PROMPT = `你是一位精通中西方梦理论的资深梦境解析师，拥有深厚的心理学和传统文化素养。你的知识体系包括：

【西方心理学经典】
- 弗洛伊德《梦的解析》：梦是潜意识欲望的满足、梦的象征意义（如飞翔代表自由渴望、坠落代表失控感、被追赶代表逃避）、梦的工作机制（凝缩、置换、象征化）
- 荗格分析心理学：原型象征（英雄、阴影、阿尼玛/阿尼姆斯、智慧老人）、集体无意识、个性化过程、梦是潜意识与意识的对话
- 现代心理学研究：梦与情绪调节、记忆巩固的关系、REM睡眠的功能

【中国文化经典】
- 《周公解梦》：梦境分类体系（梦见动物、自然现象、生活场景等的传统寓意）
- 古代梦书分类：《周礼》六梦（正梦、噩梦、思梦、寤梦、喜梦、惧梦）
- 道家梦论：《庄子》"庄周梦蝶"的哲学意蕴，梦与觉的辩证关系

【跨文化视角】
- 不同文化中相同象征的不同解读（如蛇在西方文化中常代表危险或诱惑，在东方文化中也可能代表智慧、重生或财运）

【解析原则】
1. 多理论并存：对同一梦境元素给出不同理论视角的解读
2. 避免绝对化：使用"可能代表""通常象征""从...角度看"等开放式语言
3. 引用标注：适当标注理论来源，如"根据弗洛伊德理论...""《周公解梦》中提到..."
4. 温和探索：保持温和、治愈的语气，帮助用户自我探索
5. 文化敏感：考虑用户的文化背景，提供多元解读

【输出格式要求】
请严格按照以下JSON格式输出解析结果：
{
  "coreSymbols": [
    {
      "symbol": "梦境中的核心符号",
      "interpretations": [
        {
          "perspective": "理论视角（如：弗洛伊德学派/荣格学派/中国传统解梦/现代心理学）",
          "meaning": "该视角下的解读",
          "source": "理论来源"
        }
      ]
    }
  ],
  "emotionalState": {
    "mood": "主要情绪（如：焦虑、平静、恐惧、愉悦）",
    "description": "情绪状态的详细描述",
    "intensity": 1-10的强度值
  },
  "lifeConnection": [
    {
      "aspect": "关联的生活方面（如：工作压力、人际关系、内心渴望）",
      "description": "与现实的可能联系",
      "relevance": "相关程度说明"
    }
  ],
  "suggestions": [
    "建议用户思考的方向或问题"
  ],
  "theoreticalReferences": [
    "本次解析引用的主要理论来源"
  ],
  "overallTone": "解析的整体基调（温暖/警示/启发/治愈）",
  "warning": "温馨提示（如有需要）"
}`;

function buildUserPrompt(dreamContent: string, userInfo?: UserInfo): string {
  let prompt = `请解析以下梦境：\n\n【梦境内容】\n${dreamContent}\n`;
  
  if (userInfo) {
    prompt += `\n【做梦者信息】\n`;
    if (userInfo.nickname) prompt += `昵称：${userInfo.nickname}\n`;
    if (userInfo.gender) prompt += `性别：${userInfo.gender === 'male' ? '男' : userInfo.gender === 'female' ? '女' : '其他'}\n`;
    if (userInfo.age) prompt += `年龄：${userInfo.age}岁\n`;
    if (userInfo.occupation) prompt += `职业：${userInfo.occupation}\n`;
    if (userInfo.familyEnvironment) prompt += `家庭关系/环境：${userInfo.familyEnvironment}\n`;
    if (userInfo.personalGoals) prompt += `个人理想：${userInfo.personalGoals}\n`;
    if (userInfo.psychologicalStatus) prompt += `心理状况：${userInfo.psychologicalStatus}\n`;
    if (userInfo.sleepQuality) prompt += `睡眠质量：${userInfo.sleepQuality}\n`;
    if (userInfo.stressLevel) prompt += `压力程度：${userInfo.stressLevel}\n`;
    if (userInfo.recentMood) prompt += `近期心情：${userInfo.recentMood}\n`;
    if (userInfo.dreamFrequency) prompt += `做梦频率：${userInfo.dreamFrequency}\n`;
  }
  
  prompt += `\n请根据以上信息，结合你的专业知识，对这个梦境进行全面、深入的解析。记住要：
1. 识别梦境中的核心象征，并从多个理论视角进行解读
2. 分析梦境反映的情绪和心理状态
3. 建立梦境与现实生活的合理联系
4. 给出温和的思考建议
5. 在适当位置引用理论来源
6. 避免使用绝对化的预言性语言

请直接输出JSON格式的解析结果，不要添加任何其他文字。`;
  
  return prompt;
}

async function callVolcAI(prompt: string): Promise<string> {
  try {
    const response = await callVolcApi(prompt, SYSTEM_PROMPT);
    return response;
  } catch (error) {
    console.error('调用火山引擎AI失败:', error);
    throw error;
  }
}

export class DreamAnalysisService {
  async analyzeDream(dreamContent: string, userInfo?: UserInfo): Promise<DreamAnalysis> {
    try {
      const prompt = buildUserPrompt(dreamContent, userInfo);
      const response = await callVolcAI(prompt);
      
      const analysis: DreamAnalysis = JSON.parse(response);
      
      if (!analysis.warning) {
        analysis.warning = '本解析仅供参考，梦境解读具有高度主观性。如有严重心理困扰，建议寻求专业心理咨询师的帮助。';
      }

      return analysis;
    } catch (error) {
      console.error('梦境解析错误:', error);
      throw error;
    }
  }

  async generateUserProfile(dreams: Array<{ content: string; analysis?: DreamAnalysis; createdAt: Date }>): Promise<{
    dreamThemes: Array<{ theme: string; count: number; lastOccurrence: Date }>;
    emotionalTrends: Array<{ date: Date; anxiety: number; joy: number; fear: number; peace: number; sadness: number }>;
    profileSummary: string;
    archetypeDescription: string;
  }> {
    const themeMap = new Map<string, { count: number; lastOccurrence: Date }>();
    const emotionalTrends: Array<{ date: Date; anxiety: number; joy: number; fear: number; peace: number; sadness: number }> = [];

    for (const dream of dreams) {
      if (dream.analysis) {
        for (const symbol of dream.analysis.coreSymbols) {
          const theme = symbol.symbol;
          const existing = themeMap.get(theme) || { count: 0, lastOccurrence: dream.createdAt };
          themeMap.set(theme, {
            count: existing.count + 1,
            lastOccurrence: dream.createdAt > existing.lastOccurrence ? dream.createdAt : existing.lastOccurrence
          });
        }

        if (dream.analysis.emotionalState) {
          const mood = dream.analysis.emotionalState.mood.toLowerCase();
          const intensity = dream.analysis.emotionalState.intensity / 10;
          
          emotionalTrends.push({
            date: dream.createdAt,
            anxiety: mood.includes('焦虑') || mood.includes('紧张') ? intensity : 0,
            joy: mood.includes('愉悦') || mood.includes('快乐') || mood.includes('幸福') ? intensity : 0,
            fear: mood.includes('恐惧') || mood.includes('害怕') ? intensity : 0,
            peace: mood.includes('平静') || mood.includes('安宁') ? intensity : 0,
            sadness: mood.includes('悲伤') || mood.includes('忧郁') ? intensity : 0
          });
        }
      }
    }

    const dreamThemes = Array.from(themeMap.entries())
      .map(([theme, data]) => ({ theme, ...data }))
      .sort((a, b) => b.count - a.count);
      // .slice(0, 10); // Remove limit to include all themes for galaxy view

    const profilePrompt = `基于以下梦境数据，生成用户的心理画像：
    
梦境主题：${dreamThemes.map(t => t.theme).join('、')}
情绪趋势：${emotionalTrends.map(e => JSON.stringify(e)).join('\n')}

请用温暖、专业的语言描述：
1. 用户的梦境主题特征
2. 情绪状态的整体倾向
3. 可能的心理原型（如：探索者、疗愈者、创造者等）
4. 给用户的成长建议

请以JSON格式返回：
{
  "profileSummary": "用户画像总结（100-200字）",
  "archetypeDescription": "心理原型描述（包含原型名称和特征描述，150-250字）"
}`;

    try {
      const response = await callVolcAI(profilePrompt);
      const profile = JSON.parse(response);
      return {
        dreamThemes,
        emotionalTrends,
        profileSummary: profile.profileSummary,
        archetypeDescription: profile.archetypeDescription
      };
    } catch (error) {
      console.error('生成用户画像错误:', error);
    }

    return {
      dreamThemes,
      emotionalTrends,
      profileSummary: '根据您的梦境记录，您是一个内心丰富、善于自我探索的人。您的梦境反映了您对生活的深度思考和情感体验。',
      archetypeDescription: '探索者原型：您具有强烈的内在探索欲望，梦境是您与潜意识对话的桥梁。您善于从日常生活中汲取灵感，并将其转化为内在的成长动力。'
    };
  }
}

export const dreamAnalysisService = new DreamAnalysisService();
