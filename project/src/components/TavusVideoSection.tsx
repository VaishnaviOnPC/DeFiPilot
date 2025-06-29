import React, { useState } from 'react';
import { Play, RotateCcw, Loader2, Video, AlertCircle } from 'lucide-react';

interface TavusVideoSectionProps {
  strategyData?: {
    id?: string;
    intent: string;
    plan: string;
    riskReward: string;
    apy: string;
    riskLevel: string;
  };
}

const TavusVideoSection: React.FC<TavusVideoSectionProps> = ({ strategyData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string>('');

  const handleGenerateVideo = async () => {
    if (!strategyData) {
      setError('No strategy data available for video generation');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setGenerationStatus('Initializing video generation...');
    
    try {
      // Step 1: Request video generation
      const generateResponse = await fetch('/api/tavus/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        },
        body: JSON.stringify({
          strategyId: strategyData.id,
          content: {
            intent: strategyData.intent,
            plan: strategyData.plan,
            riskReward: strategyData.riskReward,
            apy: strategyData.apy,
            riskLevel: strategyData.riskLevel
          },
          template: 'defi-strategy-explanation',
          voice: 'professional-male' // or allow user to choose
        })
      });

      if (!generateResponse.ok) {
        throw new Error(`Failed to start video generation: ${generateResponse.status} ${generateResponse.statusText}`);
      }

      const generateData = await generateResponse.json();
      setVideoId(generateData.videoId);
      setGenerationStatus('Video generation started...');

      // Step 2: Poll for video completion
      const pollVideo = async () => {
        try {
          const statusResponse = await fetch(`/api/tavus/video/${generateData.videoId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(localStorage.getItem('auth_token') && {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              })
            }
          });

          if (!statusResponse.ok) {
            throw new Error(`Failed to check video status: ${statusResponse.status}`);
          }

          const statusData = await statusResponse.json();
          
          switch (statusData.status) {
            case 'processing':
              setGenerationStatus('Processing video content...');
              setTimeout(pollVideo, 3000); // Poll every 3 seconds
              break;
            case 'rendering':
              setGenerationStatus('Rendering final video...');
              setTimeout(pollVideo, 5000); // Poll every 5 seconds during rendering
              break;
            case 'completed':
              setVideoUrl(statusData.url);
              setGenerationStatus('Video generation completed!');
              break;
            case 'failed':
              throw new Error(statusData.error || 'Video generation failed');
            default:
              setGenerationStatus(`Status: ${statusData.status}`);
              setTimeout(pollVideo, 3000);
          }
        } catch (pollError) {
          console.error('Error polling video status:', pollError);
          throw pollError;
        }
      };

      // Start polling
      setTimeout(pollVideo, 2000);

    } catch (err) {
      console.error('Error generating video:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate video. Please try again.');
    } finally {
      if (!videoUrl) {
        setIsGenerating(false);
      }
    }
  };

  const handleRegenerate = () => {
    setVideoUrl(null);
    setVideoId(null);
    setGenerationStatus('');
    handleGenerateVideo();
  };

  const handleDownloadVideo = async () => {
    if (!videoUrl) return;

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `defi-strategy-${strategyData?.id || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading video:', err);
      setError('Failed to download video. Please try again.');
    }
  };

  // Complete generation when video URL is available
  React.useEffect(() => {
    if (videoUrl && isGenerating) {
      setIsGenerating(false);
    }
  }, [videoUrl, isGenerating]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
          <span>📹</span>
          <span>Personalized Strategy Video</span>
        </h2>
        <p className="text-blue-200 text-lg">
          Get your DeFi strategy explained in a personalized video presentation
        </p>
      </div>

      {/* Main Content Container */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 hover:border-white/20 transition-all duration-300">
        
        {/* Generate Button - Show when no video and not generating */}
        {!videoUrl && !isGenerating && (
          <div className="text-center py-12">
            <div className="mb-6">
              <Video className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-60" />
              <p className="text-blue-200 mb-6">
                Create a personalized video explanation of your DeFi strategy using Tavus AI
              </p>
            </div>
            
            <button
              onClick={handleGenerateVideo}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Play className="w-6 h-6" />
              <span className="text-lg">Generate Video</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-purple-400 mx-auto animate-spin" />
                <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-pulse"></div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-3">
              Generating Your Video...
            </h3>
            <p className="text-blue-200 mb-4">
              {generationStatus || 'Tavus AI is creating your personalized strategy explanation'}
            </p>
            
            {/* Progress Steps */}
            <div className="max-w-md mx-auto">
              <div className="space-y-2 text-sm text-blue-300">
                <div className="flex items-center justify-between">
                  <span>Analyzing strategy data</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Generating AI script</span>
                  <span className={generationStatus.includes('script') ? 'text-green-400' : ''}>
                    {generationStatus.includes('script') ? '✓' : <Loader2 className="w-4 h-4 animate-spin" />}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Creating video</span>
                  <span className={generationStatus.includes('rendering') ? 'text-green-400' : 'opacity-50'}>
                    {generationStatus.includes('rendering') ? <Loader2 className="w-4 h-4 animate-spin" /> : '⏳'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Finalizing</span>
                  <span className={generationStatus.includes('completed') ? 'text-green-400' : 'opacity-50'}>
                    {generationStatus.includes('completed') ? '✓' : '⏳'}
                  </span>
                </div>
              </div>
            </div>

            {videoId && (
              <div className="mt-4 text-xs text-blue-400">
                Video ID: {videoId}
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left">
                <p className="text-red-300">{error}</p>
              </div>
            </div>
            <button
              onClick={handleGenerateVideo}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 underline underline-offset-4"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Video Preview */}
        {videoUrl && !isGenerating && (
          <div className="space-y-6">
            {/* Video Container */}
            <div className="relative rounded-2xl overflow-hidden bg-black/50 border border-white/10">
              <div className="aspect-video">
                <video
                  controls
                  className="w-full h-full object-cover"
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'%3E%3Crect width='1280' height='720' fill='%23000'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-size='48' font-family='system-ui'%3EPersonalized DeFi Strategy%3C/text%3E%3C/svg%3E"
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {/* Video Overlay Info */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-white text-sm font-medium">Generated by Tavus AI</span>
              </div>
            </div>

            {/* Video Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleRegenerate}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 border border-white/20"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Regenerate</span>
              </button>
              
              <button
                onClick={handleDownloadVideo}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <Video className="w-5 h-5" />
                <span>Download Video</span>
              </button>
            </div>

            {/* Video Details */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-blue-300 text-sm">Video ID</p>
                  <p className="text-white font-semibold text-xs">{videoId?.slice(0, 8)}...</p>
                </div>
                <div>
                  <p className="text-blue-300 text-sm">Quality</p>
                  <p className="text-white font-semibold">1080p</p>
                </div>
                <div>
                  <p className="text-blue-300 text-sm">Generated</p>
                  <p className="text-white font-semibold">Just now</p>
                </div>
                <div>
                  <p className="text-blue-300 text-sm">Provider</p>
                  <p className="text-white font-semibold">Tavus AI</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tavus Badge */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://tavus.io"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium border border-white/20 shadow-lg"
        >
          🎬 Powered by Tavus
        </a>
      </div>
    </div>
  );
};

export default TavusVideoSection;