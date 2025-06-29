import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputBlockProps {
  onVoiceInput: (transcript: string) => void;
  isProcessing: boolean;
}

const VoiceInputBlock: React.FC<VoiceInputBlockProps> = ({ onVoiceInput, isProcessing }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          onVoiceInput(transcript);
          setTranscript('');
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        setError(`Speech recognition error: ${event.error}`);
        console.error('Speech recognition error:', event.error);
      };
    }
  }, [onVoiceInput, transcript]);

  const startListening = () => {
    if (recognitionRef.current && !isProcessing) {
      setError(null);
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        setIsListening(false);
        setError('Failed to start voice recognition. Please check your microphone permissions.');
      }
    } else if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Voice Input Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className={`
          relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center
          transition-all duration-300 transform hover:scale-105 active:scale-95
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : isProcessing
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          }
          shadow-2xl hover:shadow-3xl
        `}
      >
        {/* Ripple Effect */}
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
        )}
        
        {/* Icon */}
        <div className="relative z-10">
          {isProcessing ? (
            <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-white animate-spin" />
          ) : isListening ? (
            <MicOff className="w-12 h-12 md:w-16 md:h-16 text-white" />
          ) : (
            <Mic className="w-12 h-12 md:w-16 md:h-16 text-white" />
          )}
        </div>
      </button>

      {/* Button Label */}
      <p className="mt-6 text-white font-semibold text-lg">
        {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Start Speaking'}
      </p>

      {/* Live Transcript */}
      {transcript && (
        <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg max-w-md">
          <p className="text-blue-100 text-sm italic">"{transcript}"</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg max-w-md">
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-400 hover:text-red-300 transition-colors duration-200 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Browser Support Info */}
      {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
        <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg max-w-md">
          <p className="text-yellow-300 text-sm">
            Voice recognition not supported. Please use Chrome or Edge browser for voice input.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceInputBlock;