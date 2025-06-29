import { 
  API_ENDPOINTS, 
  type ApiResponse, 
  type StrategyHistoryItem, 
  type CreateStrategyRequest, 
  type GenerateStrategyResponse,
  type UpdateStrategyRequest,
  type TavusGenerateVideoRequest,
  type TavusVideoResponse,
  getAppConfig
} from '../types/api';

// Base API configuration
const config = getAppConfig();
const API_BASE_URL = config.apiBaseUrl;
const API_TIMEOUT = 30000; // 30 seconds for video generation

// API Client class for handling HTTP requests
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle both wrapped and unwrapped responses
      if (data.success !== undefined) {
        return data;
      } else {
        return {
          data,
          success: true
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please check your connection and try again');
        }
        throw error;
      }
      
      throw new Error('An unexpected error occurred');
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // GET request
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Strategy API functions
export const strategyApi = {
  // Generate new strategy from voice input
  generateStrategy: async (data: CreateStrategyRequest): Promise<GenerateStrategyResponse> => {
    const response = await apiClient.post<GenerateStrategyResponse>(API_ENDPOINTS.STRATEGIES.GENERATE, data);
    return response.data;
  },

  // Get strategy history
  getHistory: async (): Promise<StrategyHistoryItem[]> => {
    const response = await apiClient.get<StrategyHistoryItem[]>(API_ENDPOINTS.STRATEGIES.HISTORY);
    return response.data;
  },

  // Get single strategy
  getStrategy: async (id: string): Promise<StrategyHistoryItem> => {
    const response = await apiClient.get<StrategyHistoryItem>(API_ENDPOINTS.STRATEGIES.GET(id));
    return response.data;
  },

  // Create new strategy
  createStrategy: async (data: CreateStrategyRequest): Promise<StrategyHistoryItem> => {
    const response = await apiClient.post<StrategyHistoryItem>(API_ENDPOINTS.STRATEGIES.CREATE, data);
    return response.data;
  },

  // Update strategy
  updateStrategy: async (data: UpdateStrategyRequest): Promise<StrategyHistoryItem> => {
    const response = await apiClient.put<StrategyHistoryItem>(API_ENDPOINTS.STRATEGIES.UPDATE(data.id), data);
    return response.data;
  },

  // Delete strategy
  deleteStrategy: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.STRATEGIES.DELETE(id));
  },

  // Save/bookmark strategy
  saveStrategy: async (id: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.STRATEGIES.SAVE(id));
  },

  // Toggle favorite status
  toggleFavorite: async (id: string): Promise<StrategyHistoryItem> => {
    const response = await apiClient.post<StrategyHistoryItem>(API_ENDPOINTS.STRATEGIES.FAVORITE(id));
    return response.data;
  },
};

// Tavus API functions
export const tavusApi = {
  // Generate video
  generateVideo: async (data: TavusGenerateVideoRequest): Promise<TavusVideoResponse> => {
    const response = await apiClient.post<TavusVideoResponse>(
      API_ENDPOINTS.TAVUS.GENERATE_VIDEO,
      data
    );
    return response.data;
  },

  // Get video status/URL
  getVideo: async (videoId: string): Promise<TavusVideoResponse> => {
    const response = await apiClient.get<TavusVideoResponse>(
      API_ENDPOINTS.TAVUS.GET_VIDEO(videoId)
    );
    return response.data;
  },

  // List user's videos
  listVideos: async (): Promise<TavusVideoResponse[]> => {
    const response = await apiClient.get<TavusVideoResponse[]>(API_ENDPOINTS.TAVUS.LIST_VIDEOS);
    return response.data;
  },
};

// Voice API functions
export const voiceApi = {
  // Transcribe audio to text
  transcribeAudio: async (audioBlob: Blob): Promise<{ transcript: string; confidence: number }> => {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VOICE.TRANSCRIBE}`, {
      method: 'POST',
      headers: {
        ...apiClient['getAuthHeaders'](),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to transcribe audio: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },

  // Convert text to speech
  textToSpeech: async (text: string, voice?: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VOICE.TTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiClient['getAuthHeaders'](),
      },
      body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  },
};

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Authentication utilities
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export default apiClient;