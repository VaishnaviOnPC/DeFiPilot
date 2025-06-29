import { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '../services/api';

// Generic hook for API calls with loading and error states
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      console.error('API call failed:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Hook for API mutations (POST, PUT, DELETE)
export function useApiMutation<T, P = void>(
  apiCall: (params: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(params);
      return result;
    } catch (err) {
      console.error('API mutation failed:', err);
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    reset,
  };
}

// Hook specifically for strategy history
export function useStrategyHistory() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { strategyApi } = await import('../services/api');
      const data = await strategyApi.getHistory();
      setStrategies(data);
    } catch (err) {
      console.error('Failed to fetch strategy history:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStrategy = useCallback(async (id: string) => {
    try {
      const { strategyApi } = await import('../services/api');
      await strategyApi.deleteStrategy(id);
      setStrategies(prev => prev.filter(strategy => strategy.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete strategy:', err);
      setError(handleApiError(err));
      return false;
    }
  }, []);

  const saveStrategy = useCallback(async (id: string) => {
    try {
      const { strategyApi } = await import('../services/api');
      await strategyApi.saveStrategy(id);
      
      // Update local state to reflect saved status
      setStrategies(prev => 
        prev.map(strategy => 
          strategy.id === id 
            ? { ...strategy, updatedAt: new Date().toISOString(), isFavorite: true }
            : strategy
        )
      );
      return true;
    } catch (err) {
      console.error('Failed to save strategy:', err);
      setError(handleApiError(err));
      return false;
    }
  }, []);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  return {
    strategies,
    loading,
    error,
    refetch: fetchStrategies,
    deleteStrategy,
    saveStrategy,
  };
}

// Hook for Tavus video generation
export function useTavusVideo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<any>(null);

  const generateVideo = useCallback(async (strategyData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const { tavusApi } = await import('../services/api');
      const result = await tavusApi.generateVideo({
        strategyId: strategyData.id,
        content: {
          intent: strategyData.intent,
          plan: strategyData.plan,
          riskReward: strategyData.riskReward,
          apy: strategyData.apy,
          riskLevel: strategyData.riskLevel
        },
        template: 'defi-strategy-explanation',
        voice: 'professional-male'
      });
      
      setVideoData(result);
      return result;
    } catch (err) {
      console.error('Failed to generate video:', err);
      setError(handleApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getVideoStatus = useCallback(async (videoId: string) => {
    try {
      const { tavusApi } = await import('../services/api');
      const result = await tavusApi.getVideo(videoId);
      setVideoData(result);
      return result;
    } catch (err) {
      console.error('Failed to get video status:', err);
      setError(handleApiError(err));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setVideoData(null);
    setLoading(false);
  }, []);

  return {
    generateVideo,
    getVideoStatus,
    loading,
    error,
    videoData,
    reset,
  };
}

// Hook for voice recognition
export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setError(`Speech recognition error: ${event.error}`);
      };

      recognition.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    setIsListening(false);
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    transcript,
    error,
    isSupported,
    reset,
  };
}