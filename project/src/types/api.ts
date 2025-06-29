// API Types for DeFi Strategy Application

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StrategyHistoryItem {
  id: string;
  title: string;
  intent: string;
  plan: string;
  riskReward: string;
  apy: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  timestamp: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface CreateStrategyRequest {
  intent: string;
  voiceTranscript?: string;
  preferences?: {
    riskTolerance?: 'Low' | 'Medium' | 'High';
    investmentAmount?: number;
    timeHorizon?: string;
  };
}

export interface GenerateStrategyResponse {
  id: string;
  title: string;
  plan: string;
  riskReward: string;
  apy: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  tags?: string[];
  confidence?: number;
}

export interface UpdateStrategyRequest extends Partial<CreateStrategyRequest> {
  id: string;
}

// Tavus API Types
export interface TavusGenerateVideoRequest {
  strategyId?: string;
  content: {
    intent: string;
    plan: string;
    riskReward: string;
    apy: string;
    riskLevel: string;
  };
  template?: string;
  voice?: string;
  persona?: string;
}

export interface TavusVideoResponse {
  videoId: string;
  status: 'processing' | 'rendering' | 'completed' | 'failed';
  url?: string;
  error?: string;
  metadata?: {
    duration?: number;
    size?: number;
    quality?: string;
  };
}

// Voice Recognition Types
export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  language: string;
}

// API Endpoints Configuration
export const API_ENDPOINTS = {
  STRATEGIES: {
    LIST: '/api/strategies',
    HISTORY: '/api/strategies/history',
    GENERATE: '/api/strategies/generate',
    CREATE: '/api/strategies',
    GET: (id: string) => `/api/strategies/${id}`,
    UPDATE: (id: string) => `/api/strategies/${id}`,
    DELETE: (id: string) => `/api/strategies/${id}`,
    SAVE: (id: string) => `/api/strategies/${id}/save`,
    FAVORITE: (id: string) => `/api/strategies/${id}/favorite`,
  },
  USER: {
    PROFILE: '/api/user/profile',
    PREFERENCES: '/api/user/preferences',
    AUTH: '/api/auth',
  },
  TAVUS: {
    GENERATE_VIDEO: '/api/tavus/generate',
    GET_VIDEO: (id: string) => `/api/tavus/video/${id}`,
    LIST_VIDEOS: '/api/tavus/videos',
  },
  VOICE: {
    TRANSCRIBE: '/api/voice/transcribe',
    TTS: '/api/voice/tts',
  }
} as const;

// Environment Configuration
export interface AppConfig {
  apiBaseUrl: string;
  tavusApiKey?: string;
  voiceApiKey?: string;
  enableMockData: boolean;
}

export const getAppConfig = (): AppConfig => ({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  tavusApiKey: import.meta.env.VITE_TAVUS_API_KEY,
  voiceApiKey: import.meta.env.VITE_VOICE_API_KEY,
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
});