import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Save, Calendar, TrendingUp, Shield, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { Screen, StrategyData } from '../App';

interface HistoryScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface HistoryItem extends StrategyData {
  id: string;
  title: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onNavigate }) => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  // Fetch history data from API
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/strategies/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setHistoryData(data.strategies || data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load strategy history');
    } finally {
      setLoading(false);
    }
  };

  // Save strategy
  const handleSaveStrategy = async (id: string) => {
    try {
      setSavingIds(prev => new Set(prev).add(id));
      
      const response = await fetch(`/api/strategies/${id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to save strategy: ${response.status} ${response.statusText}`);
      }

      // Update local state to reflect saved status
      setHistoryData(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, updatedAt: new Date().toISOString(), isFavorite: true }
            : item
        )
      );

      console.log('Strategy saved successfully');
      
    } catch (err) {
      console.error('Error saving strategy:', err);
      setError(err instanceof Error ? err.message : 'Failed to save strategy. Please try again.');
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Delete strategy
  const handleDeleteStrategy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this strategy? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingIds(prev => new Set(prev).add(id));
      
      const response = await fetch(`/api/strategies/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete strategy: ${response.status} ${response.statusText}`);
      }

      // Remove from local state
      setHistoryData(prev => prev.filter(item => item.id !== id));
      
      console.log('Strategy deleted successfully');
      
    } catch (err) {
      console.error('Error deleting strategy:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete strategy. Please try again.');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Retry loading data
  const handleRetry = () => {
    fetchHistory();
  };

  // Load data on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'text-green-400 bg-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'High': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center space-x-2 text-blue-300 hover:text-white transition-colors duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white">Strategy History</h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors duration-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-white mb-2">Loading Strategies...</h3>
            <p className="text-blue-300">Fetching your DeFi strategy history from the server</p>
          </div>
        </div>
      )}

      {/* History Content */}
      {!loading && (
        <div className="max-w-6xl mx-auto">
          {historyData.length === 0 ? (
            <div className="text-center py-16">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Strategies Yet</h3>
              <p className="text-gray-500 mb-6">Start by creating your first DeFi strategy!</p>
              <button
                onClick={() => onNavigate('home')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Create Strategy
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                  <div className="grid grid-cols-6 gap-4 p-6 bg-white/5 border-b border-white/10 text-sm font-semibold text-blue-200">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Date</span>
                    </div>
                    <div>Strategy Title</div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>APY Estimate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Risk Level</span>
                    </div>
                    <div>Intent</div>
                    <div>Actions</div>
                  </div>
                  {historyData.map((strategy) => (
                    <div key={strategy.id} className="grid grid-cols-6 gap-4 p-6 border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                      <div className="text-blue-300">{formatDate(strategy.createdAt)}</div>
                      <div className="text-white font-medium">{strategy.title || 'Untitled Strategy'}</div>
                      <div className="text-green-400 font-semibold">{strategy.apy}</div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(strategy.riskLevel)}`}>
                          {strategy.riskLevel}
                        </span>
                      </div>
                      <div className="text-gray-300 text-sm truncate">{strategy.intent}</div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveStrategy(strategy.id)}
                          disabled={savingIds.has(strategy.id)}
                          className={`transition-colors duration-200 disabled:opacity-50 ${
                            strategy.isFavorite 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : 'text-blue-400 hover:text-blue-300'
                          }`}
                          title={strategy.isFavorite ? 'Saved Strategy' : 'Save Strategy'}
                        >
                          {savingIds.has(strategy.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteStrategy(strategy.id)}
                          disabled={deletingIds.has(strategy.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200 disabled:opacity-50"
                          title="Delete Strategy"
                        >
                          {deletingIds.has(strategy.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {historyData.map((strategy) => (
                  <div key={strategy.id} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{strategy.title || 'Untitled Strategy'}</h3>
                        <p className="text-blue-300 text-sm">{formatDate(strategy.createdAt)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {strategy.isFavorite && (
                          <span className="text-yellow-400 text-xs">★</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(strategy.riskLevel)}`}>
                          {strategy.riskLevel}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-300 text-sm mb-2">{strategy.intent}</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-green-400 font-semibold">APY: {strategy.apy}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleSaveStrategy(strategy.id)}
                        disabled={savingIds.has(strategy.id)}
                        className={`flex items-center space-x-1 transition-colors duration-200 disabled:opacity-50 ${
                          strategy.isFavorite 
                            ? 'text-yellow-400 hover:text-yellow-300' 
                            : 'text-blue-400 hover:text-blue-300'
                        }`}
                      >
                        {savingIds.has(strategy.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span className="text-sm">{strategy.isFavorite ? 'Saved' : 'Save'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteStrategy(strategy.id)}
                        disabled={deletingIds.has(strategy.id)}
                        className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors duration-200 disabled:opacity-50"
                      >
                        {deletingIds.has(strategy.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;