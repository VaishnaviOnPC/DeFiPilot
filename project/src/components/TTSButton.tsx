import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface TTSButtonProps {
  text: string;
}

const TTSButton: React.FC<TTSButtonProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayTTS = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback for browsers without TTS support
      alert('Text-to-speech is not supported in your browser');
    }
  };

  return (
    <button
      onClick={handlePlayTTS}
      className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 border border-white/20"
    >
      {isPlaying ? (
        <VolumeX className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
      <span>{isPlaying ? 'Stop Explanation' : 'Play Explanation'}</span>
    </button>
  );
};

export default TTSButton;