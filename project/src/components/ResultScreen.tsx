import React from 'react';
import { ArrowLeft, Play, RotateCcw, Brain, TrendingUp, Shield } from 'lucide-react';
import ResponseCard from './ResponseCard';
import TTSButton from './TTSButton';
import TavusVideoSection from './TavusVideoSection';
import type { Screen, StrategyData } from '../App';

interface ResultScreenProps {
  strategyData: StrategyData;
  onNavigate: (screen: Screen) => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ strategyData, onNavigate }) => {
  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-blue-300 hover:text-white transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        
        <button
          onClick={() => onNavigate('history')}
          className="text-blue-300 hover:text-white transition-colors duration-300 underline underline-offset-4"
        >
          View History
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Here's Your DeFi Strategy
          </h1>
          <p className="text-blue-200 text-lg">
            AI-generated strategy based on your voice input
          </p>
        </div>

        {/* Strategy Cards */}
        <div className="space-y-6 mb-8">
          <ResponseCard
            title="Intent Summary"
            icon={<Brain className="w-6 h-6 text-purple-400" />}
            content={strategyData.intent}
            gradient="from-purple-500/20 to-pink-500/20"
          />
          
          <ResponseCard
            title="Simulated Plan"
            icon={<TrendingUp className="w-6 h-6 text-green-400" />}
            content={strategyData.plan}
            gradient="from-green-500/20 to-blue-500/20"
          />
          
          <ResponseCard
            title="Risk/Reward Summary"
            icon={<Shield className="w-6 h-6 text-blue-400" />}
            content={strategyData.riskReward}
            gradient="from-blue-500/20 to-cyan-500/20"
          />
        </div>

        {/* Tavus Video Section */}
        <TavusVideoSection strategyData={strategyData} />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <TTSButton 
            text={`${strategyData.plan} ${strategyData.riskReward}`}
          />
          
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Try Another Strategy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;