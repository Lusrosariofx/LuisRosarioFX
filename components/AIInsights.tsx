
import React, { useState, useEffect } from 'react';
import { Trade } from '../types';
import { analyzeTrades } from '../services/geminiService';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface AIInsightsProps {
  trades: Trade[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ trades }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    if (trades.length < 3) {
      setAnalysis("Please log at least 3 trades for a meaningful AI analysis.");
      return;
    }
    setLoading(true);
    const result = await analyzeTrades(trades);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    if (trades.length >= 3 && !analysis) {
      fetchAnalysis();
    }
  }, [trades]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">AI Trade Performance Analysis</h2>
          <p className="text-gray-400">Personalized coaching insights based on your recent activity.</p>
        </div>
        <button 
          onClick={fetchAnalysis}
          disabled={loading || trades.length < 3}
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh Analysis
        </button>
      </header>

      {trades.length < 3 ? (
        <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-2xl flex flex-col items-center text-center gap-4">
          <AlertCircle className="text-amber-500" size={48} />
          <div>
            <h3 className="text-xl font-semibold mb-2">More Data Needed</h3>
            <p className="text-gray-400 max-w-md">Gemini needs a larger sample of trades to identify meaningful patterns in your strategy and psychology.</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#111111] border border-[#222222] p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={120} className="text-indigo-500" />
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-gray-400 animate-pulse">Analyzing trading patterns and psychology...</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-gray-200">
                {analysis.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('-') || line.startsWith('*') ? 'pl-4 mb-2' : 'mb-4'}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
