import React, { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import ResultScreen from './components/ResultScreen';
import HistoryScreen from './components/HistoryScreen';

export type Screen = 'home' | 'result' | 'history';

export interface StrategyData {
  id?: string;
  intent: string;
  plan: string;
  riskReward: string;
  apy: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  timestamp: string;
  title?: string;
  tags?: string[];
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [strategyData, setStrategyData] = useState<StrategyData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
    setError(null);
  };

  const handleVoiceInput = async (transcript: string) => {
    setVoiceTranscript(transcript);
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call real API to generate strategy
      const response = await fetch('/api/strategies/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        },
        body: JSON.stringify({
          intent: transcript,
          voiceTranscript: transcript
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate strategy: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const strategy: StrategyData = {
        id: data.id,
        intent: transcript,
        plan: data.plan,
        riskReward: data.riskReward,
        apy: data.apy,
        riskLevel: data.riskLevel,
        timestamp: new Date().toLocaleDateString(),
        title: data.title,
        tags: data.tags
      };
      
      setStrategyData(strategy);
      setCurrentScreen('result');
    } catch (err) {
      console.error('Error generating strategy:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate strategy. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      {/* Global Error Message */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 flex items-center space-x-3 backdrop-blur-sm">
            <div className="flex-1">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors duration-200 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Screen Content */}
      <div className="relative z-10">
        {currentScreen === 'home' && (
          <HomeScreen 
            onVoiceInput={handleVoiceInput}
            onNavigate={navigateToScreen}
            isProcessing={isProcessing}
          />
        )}
        {currentScreen === 'result' && strategyData && (
          <ResultScreen 
            strategyData={strategyData}
            onNavigate={navigateToScreen}
          />
        )}
        {currentScreen === 'history' && (
          <HistoryScreen 
            onNavigate={navigateToScreen}
          />
        )}
      </div>
    </div>
  );
}

export default App;