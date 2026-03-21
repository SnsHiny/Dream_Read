export interface IUser {
  _id: string;
  nickname: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  occupation: string;
  familyEnvironment: string;
  personalGoals: string;
  psychologicalStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDream {
  _id: string;
  userId: string;
  content: string;
  inputType: 'text' | 'voice';
  mood?: string;
  tags: string[];
  analysis?: IDreamAnalysis;
  createdAt: Date;
}

export interface IDreamAnalysis {
  coreSymbols: {
    symbol: string;
    interpretations: {
      perspective: string;
      meaning: string;
      source: string;
    }[];
  }[];
  emotionalState: {
    mood: string;
    description: string;
    intensity: number;
  };
  lifeConnection: {
    aspect: string;
    description: string;
    relevance: string;
  }[];
  suggestions: string[];
  theoreticalReferences: string[];
  overallTone: string;
  warning?: string;
}

export interface IUserProfile {
  _id: string;
  userId: string;
  dreamThemes: {
    theme: string;
    count: number;
    lastOccurrence: Date;
  }[];
  emotionalTrends: {
    date: Date;
    anxiety: number;
    joy: number;
    fear: number;
    peace: number;
    sadness: number;
  }[];
  profileSummary: string;
  archetypeDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisRequest {
  dreamContent: string;
  userInfo: Partial<IUser>;
  previousDreams?: IDream[];
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: IDreamAnalysis;
  error?: string;
}
