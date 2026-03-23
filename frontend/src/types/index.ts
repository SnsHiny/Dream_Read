export interface User {
  id: string;
  _id?: string;
  phoneNumber?: string;
  nickname: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  occupation: string;
  familyEnvironment: string;
  personalGoals: string;
  psychologicalStatus: string;
  // New fields for better dream analysis
  sleepQuality?: string;
  stressLevel?: string;
  recentMood?: string;
  dreamFrequency?: string;
  recurringThemes?: string[];
  
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SymbolInterpretation {
  perspective: string;
  meaning: string;
  source: string;
}

export interface CoreSymbol {
  symbol: string;
  interpretations: SymbolInterpretation[];
}

export interface EmotionalState {
  mood: string;
  description: string;
  intensity: number;
}

export interface LifeConnection {
  aspect: string;
  description: string;
  relevance: string;
}

export interface DreamAnalysis {
  coreSymbols: CoreSymbol[];
  emotionalState: EmotionalState;
  lifeConnection: LifeConnection[];
  suggestions: string[];
  theoreticalReferences: string[];
  overallTone: string;
  warning?: string;
}

export interface Dream {
  id: string;
  _id?: string;
  userId: string;
  user_id?: string;
  dreamDate?: string;
  dream_date?: string;
  content: string;
  inputType: 'text' | 'voice';
  input_type?: 'text' | 'voice';
  mood?: string;
  tags: string[];
  analysis?: DreamAnalysis;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DreamTheme {
  theme: string;
  count: number;
  lastOccurrence: string;
}

export interface EmotionalTrend {
  date: string;
  happiness: number;
  sadness: number;
  anger: number;
  fear: number;
  disgust: number;
  surprise: number;
}

export interface UserProfile {
  id: string;
  _id?: string;
  userId: string;
  user_id?: string;
  dreamThemes: DreamTheme[];
  emotionalTrends: EmotionalTrend[];
  profileSummary: string;
  archetypeDescription: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  dreams: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
