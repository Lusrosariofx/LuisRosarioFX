
import React, { useState } from 'react';
import { Camera, Sparkles, Loader2, ArrowUpCircle, ArrowDownCircle, MinusCircle, Target, TrendingUp, Info } from 'lucide-react';
import { analyzeDirectionBias, ChartAnalysisResult } from '../services/geminiService';

const DirectionAssistant: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChartAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeDirectionBias(image);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Failed to analyze chart.");
    } finally {
      setLoading(false);
    }
  };

  const getBiasStyles = (bias: string) => {
    switch (bias) {
      case 'Bullish': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <ArrowUpCircle className="text-emerald-400" size={48} /> };
      case 'Bearish': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: <ArrowDownCircle className="text-rose-400" size={48} /> };
      default: return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <MinusCircle className="text-amber-400" size={48} /> };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Daily Direction AI</h2>
        </div>
        <p className="text-gray-500 text-sm flex items-center gap-2">
          Technical Analysis by Gemini 3 Pro 
          <span className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase ml-2">DIRECTIONDAY</span>
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Upload Zone */}
        <div className="space-y-4">
          <div className={`relative bg-[#111] border-2 border-dashed rounded-[2.5rem] overflow-hidden transition-all aspect-video flex flex-col items-center justify-center p-4 ${
            image ? 'border-indigo-500/50' : 'border-[#222] hover:border-[#333]'
          }`}>
            {image ? (
              <>
                <img src={image} className="absolute inset-0 w-full h-full object-contain p-2" alt="Chart Preview" />
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                   <label className="bg-white text-black px-6 py-3 rounded-2xl font-black text-xs uppercase cursor-pointer hover:bg-gray-200 transition-all">
                     Change Chart
                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </label>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer group w-full h-full">
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[#333]">
                  <Camera className="text-gray-400" size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-300">Upload TradingView Screenshot</h4>
                <p className="text-xs text-gray-500 mt-2 text-center max-w-[280px]">AI will analyze price action, levels, and trend structure to find the bias.</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          <button 
            disabled={!image || loading}
            onClick={startAnalysis}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loading ? 'Analyzing Technicals...' : 'Find Direction for the Day'}
          </button>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold">
              <Info size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="space-y-6">
          {!result && !loading && (
            <div className="bg-[#111] border border-[#222] rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center gap-4 opacity-40">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <TrendingUp size={32} className="text-gray-600" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Analysis Pending</p>
            </div>
          )}

          {loading && (
            <div className="bg-[#111] border border-[#222] rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center gap-6">
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Processing Price Action</h4>
                <p className="text-xs text-gray-500 max-w-[200px]">Gemini 3 Pro is identifying liquidity zones and market structure...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              {/* Bias Card */}
              <div className={`p-8 rounded-[2.5rem] border ${getBiasStyles(result.bias).border} ${getBiasStyles(result.bias).bg} flex flex-col items-center text-center relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   {getBiasStyles(result.bias).icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Directional Bias</span>
                <div className="flex flex-col items-center gap-4">
                  {getBiasStyles(result.bias).icon}
                  <h3 className={`text-4xl font-black uppercase tracking-tighter ${getBiasStyles(result.bias).color}`}>
                    {result.bias}
                  </h3>
                </div>
                <div className="mt-6 flex items-center gap-4 bg-black/40 px-6 py-2 rounded-full border border-white/5">
                  <span className="text-[10px] font-black uppercase text-gray-500">Confidence</span>
                  <span className="text-lg font-black text-white">{result.confidence}/10</span>
                </div>
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#111] border border-[#222] p-8 rounded-[2rem] space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                    <Info size={14} /> Analysis Reasoning
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">
                    {result.reasoning}
                  </p>
                </div>

                <div className="bg-[#111] border border-[#222] p-8 rounded-[2rem] space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <Target size={14} /> Key Levels to Watch
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keyLevels.map((level, idx) => (
                      <span key={idx} className="bg-black border border-[#333] px-4 py-2 rounded-xl text-[11px] font-bold text-white font-mono">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectionAssistant;
