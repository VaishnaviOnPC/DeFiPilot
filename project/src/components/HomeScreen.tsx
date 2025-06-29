import React, { useState } from 'react';
import { Mic, TrendingUp, Shield, Zap } from 'lucide-react';
import VoiceInputBlock from './VoiceInputBlock';
import type { Screen } from '../App';

interface HomeScreenProps {
  onVoiceInput: (transcript: string) => void;
  onNavigate: (screen: Screen) => void;
  isProcessing: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onVoiceInput, onNavigate, isProcessing }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Bolt badge */}
      <header className="flex justify-end p-6">
        <a 
          href="https://bolt.new/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium"
        >
          ⚡ Bolt.new
        </a>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              🎙️ Talk DeFi to Me
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-8 leading-relaxed">
              Ask about staking, yield farming, or passive income strategies — we'll simulate it.
            </p>
          </div>

          {/* Voice Input Section */}
          <div className="mb-12">
            <VoiceInputBlock 
              onVoiceInput={onVoiceInput}
              isProcessing={isProcessing}
            />
            <p className="text-blue-300 mt-4 text-sm">
              Your voice will be transcribed and analyzed to build a strategy.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Smart Strategies</h3>
              <p className="text-blue-200 text-sm">AI-powered DeFi recommendations tailored to your goals</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Risk Analysis</h3>
              <p className="text-blue-200 text-sm">Comprehensive risk assessment for every strategy</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Voice First</h3>
              <p className="text-blue-200 text-sm">Natural language interface for complex DeFi operations</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => onNavigate('history')}
              className="text-blue-300 hover:text-white transition-colors duration-300 underline underline-offset-4"
            >
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center p-6">
        <p className="text-blue-300 text-sm">
          Powered by OpenAI + AssemblyAI + ElevenLabs
        </p>
      </footer>
    </div>
  );
};

export default HomeScreen;