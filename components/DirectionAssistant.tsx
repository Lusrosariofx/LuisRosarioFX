
import React, { useState } from 'react';
import { Camera, Sparkles, Loader2, ArrowUpCircle, ArrowDownCircle, MinusCircle, Target, TrendingUp, Info, Save, History, Trash2, Calendar, X, Maximize2 } from 'lucide-react';
import { analyzeDirectionBias, ChartAnalysisResult } from '../services/geminiService';
import { DailyDirection } from '../types';

interface DirectionAssistantProps {
  onSaveRecord: (record: DailyDirection) => void;
  history: DailyDirection[];
  onDeleteRecord: (id: string) => void;
}

const DirectionAssistant: React.FC<DirectionAssistantProps> = ({ onSaveRecord, history, onDeleteRecord }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChartAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filedToday, setFiledToday] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<DailyDirection | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null);
        setError(null);
        setFiledToday(false);
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

  const fileAnalysis = () => {
    if (!result) return;
    const record: DailyDirection = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      bias: result.bias,
      confidence: result.confidence,
      reasoning: result.reasoning,
      keyLevels: result.keyLevels,
      screenshot: image || undefined
    };
    onSaveRecord(record);
    setFiledToday(true);
  };

  const getBiasStyles = (bias: string) => {
    switch (bias) {
      case 'Bullish': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <ArrowUpCircle className="text-emerald-400" size={48} /> };
      case 'Bearish': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: <ArrowDownCircle className="text-rose-400" size={48} /> };
      default: return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <MinusCircle className="text-amber-400" size={48} /> };
    }
  };

  const getBiasIconSmall = (bias: string) => {
    switch (bias) {
      case 'Bullish': return <ArrowUpCircle size={14} className="text-emerald-400" />;
      case 'Bearish': return <ArrowDownCircle size={14} className="text-rose-400" />;
      default: return <MinusCircle size={14} className="text-amber-400" />;
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Daily Direction AI</h2>
        </div>
        <p className="text-gray-500 text-sm flex items-center gap-2">
          Technical Analysis by Gemini 3 Flash
          <span className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase ml-2">ARCHIVE ENABLED</span>
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Upload Zone */}
        <div className="space-y-4">
          <div className={`relative bg-[#111] border-2 border-dashed rounded-[2.5rem] overflow-hidden aspect-video flex flex-col items-center justify-center p-4 ${
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
                <h4 className="text-lg font-bold text-gray-300">Daily Execution Plan</h4>
                <p className="text-xs text-gray-500 mt-2 text-center max-w-[280px]">AI will deconstruct market structure to identify high-probability bias.</p>
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
            {loading ? 'Evaluating Structure...' : 'Extract Directional Bias'}
          </button>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold">
              <Info size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="space-y-6 min-h-[400px]">
          {loading ? (
            <div className="bg-[#111] border border-[#222] rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center gap-6 h-full">
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-xs text-gray-500 max-w-[200px] uppercase font-black tracking-widest">Scanning Liquidity Zones...</p>
            </div>
          ) : result ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className={`p-8 rounded-[2.5rem] border ${getBiasStyles(result.bias).border} ${getBiasStyles(result.bias).bg} flex flex-col items-center text-center relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   {getBiasStyles(result.bias).icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Technical Bias</span>
                <div className="flex flex-col items-center gap-4">
                  {getBiasStyles(result.bias).icon}
                  <h3 className={`text-4xl font-black uppercase tracking-tighter ${getBiasStyles(result.bias).color}`}>
                    {result.bias}
                  </h3>
                </div>
                <div className="mt-6 flex gap-4 items-center">
                  <div className="flex items-center gap-4 bg-black/40 px-6 py-2 rounded-full border border-white/5">
                    <span className="text-[10px] font-black uppercase text-gray-500">Confidence</span>
                    <span className="text-lg font-black text-white">{result.confidence}/10</span>
                  </div>
                  
                  {!filedToday ? (
                    <button 
                      onClick={fileAnalysis}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all active:scale-95"
                      title="File to History"
                    >
                      <Save size={20} />
                    </button>
                  ) : (
                    <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-full border border-emerald-500/40">
                      <Save size={20} />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#111] border border-[#222] p-8 rounded-[2rem] space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                    <Info size={14} /> Logic & Reasoning
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">
                    {result.reasoning}
                  </p>
                </div>
                <div className="bg-[#111] border border-[#222] p-8 rounded-[2rem] space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <Target size={14} /> Key Levels
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
          ) : (
            <div className="bg-[#111] border border-[#222] rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center gap-4 opacity-40 h-full">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <TrendingUp size={32} className="text-gray-600" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-gray-500">Awaiting Analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* History Record Section */}
      <div className="space-y-6 pt-12 border-t border-[#222]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="text-indigo-500" size={20} />
            <h3 className="text-xl font-black uppercase tracking-tight">Directional Archives</h3>
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{history.length} Saved Analysis</span>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map(record => (
              <div 
                key={record.id} 
                onClick={() => setViewingRecord(record)}
                className="bg-[#111] border border-[#222] rounded-[2rem] overflow-hidden flex flex-col group hover:border-indigo-500/50 transition-all cursor-pointer relative"
              >
                {record.screenshot && (
                  <div className="h-32 w-full overflow-hidden border-b border-[#222] relative">
                    <img src={record.screenshot} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all" alt="Chart" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                        <Maximize2 size={16} className="text-white" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={12} className="text-gray-500" />
                        <span className="text-[10px] font-black text-gray-500 uppercase font-mono">{record.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getBiasIconSmall(record.bias)}
                        <span className={`text-sm font-black uppercase tracking-tight ${getBiasStyles(record.bias).color}`}>{record.bias}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteRecord(record.id); }}
                      className="text-gray-700 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed font-medium">
                    {record.reasoning}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {record.keyLevels.slice(0, 3).map((lvl, i) => (
                      <span key={i} className="text-[9px] font-bold text-gray-500 bg-black/40 px-2 py-1 rounded-md border border-white/5">{lvl}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111]/50 border border-[#222] rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center opacity-30">
            <History size={40} className="text-gray-600 mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest text-gray-600">No Historical Filings</p>
          </div>
        )}
      </div>

      {/* Record Viewer Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto">
          <div className="bg-[#111] border border-[#222] rounded-[3rem] w-full max-w-6xl shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-in zoom-in fade-in duration-300">
            
            {/* Modal - Left (Chart) */}
            <div className="lg:w-2/3 bg-black relative flex items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-[#222]">
               {viewingRecord.screenshot ? (
                 <img src={viewingRecord.screenshot} className="max-h-[70vh] w-full object-contain rounded-2xl" alt="Filed Chart" />
               ) : (
                 <div className="h-64 flex flex-col items-center justify-center text-gray-700">
                   <Camera size={48} className="mb-4" />
                   <p className="text-xs font-black uppercase tracking-widest">No Visual Record</p>
                 </div>
               )}
               <div className="absolute top-8 left-8">
                  <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Filing Date</p>
                    <p className="text-sm font-black text-white font-mono">{viewingRecord.date}</p>
                  </div>
               </div>
            </div>

            {/* Modal - Right (Data) */}
            <div className="lg:w-1/3 p-8 flex flex-col relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button 
                onClick={() => setViewingRecord(null)}
                className="absolute top-8 right-8 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"
              >
                <X size={24} />
              </button>

              <div className="space-y-8 pt-6">
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Historical Conclusion</span>
                  <div className={`flex items-center gap-4 p-6 rounded-3xl border ${getBiasStyles(viewingRecord.bias).border} ${getBiasStyles(viewingRecord.bias).bg}`}>
                    {getBiasIconSmall(viewingRecord.bias)}
                    <div>
                      <h3 className={`text-3xl font-black uppercase tracking-tight ${getBiasStyles(viewingRecord.bias).color}`}>
                        {viewingRecord.bias}
                      </h3>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                        Confidence {viewingRecord.confidence}/10
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                    <Info size={14} /> Detailed Logic
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">
                    {viewingRecord.reasoning}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <Target size={14} /> Watchlist Levels
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingRecord.keyLevels.map((level, idx) => (
                      <span key={idx} className="bg-black border border-[#222] px-4 py-2.5 rounded-xl text-xs font-bold text-white font-mono shadow-lg">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-12">
                   <div className="p-6 bg-indigo-600/5 rounded-3xl border border-indigo-500/20 text-center">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Operation Record ID</p>
                     <p className="text-[8px] font-mono text-indigo-400/50 break-all uppercase">{viewingRecord.id}</p>
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DirectionAssistant;
