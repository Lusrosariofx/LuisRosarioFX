
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Sparkles, Loader2, ArrowUpCircle, ArrowDownCircle, MinusCircle, 
  Target, TrendingUp, Info, Save, History, Trash2, Calendar, X, 
  Maximize2, MessageSquare, Send, ShieldAlert, BarChart4, Copy,
  CheckCircle2, XCircle, AlertTriangle, HelpCircle
} from 'lucide-react';
import { analyzeDirectionBias, chatWithChart, ChartAnalysisResult } from '../services/geminiService';
import { DailyDirection } from '../types';
import { Language, translations } from '../translations';

interface DirectionAssistantProps {
  onSaveRecord: (record: DailyDirection) => void;
  history: DailyDirection[];
  onDeleteRecord: (id: string) => void;
  onUpdateRecord: (record: DailyDirection) => void;
  lang: Language;
}

interface ChatMessage { role: 'user' | 'assistant'; text: string; }

const DirectionAssistant: React.FC<DirectionAssistantProps> = ({ onSaveRecord, history, onDeleteRecord, onUpdateRecord, lang }) => {
  const t = translations[lang];
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChartAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filedToday, setFiledToday] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<DailyDirection | null>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, chatLoading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null); setError(null); setFiledToday(false); setChatMessages([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setLoading(true); setError(null);
    try {
      const analysis = await analyzeDirectionBias(image);
      setResult(analysis);
      setChatMessages([{ role: 'assistant', text: `Análisis completo. Sesgo: ${analysis.bias === 'Bullish' ? t.bias_bullish : analysis.bias === 'Bearish' ? t.bias_bearish : t.bias_neutral}.` }]);
    } catch (err: any) { setError(err.message || "Error."); } finally { setLoading(false); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !image || chatLoading) return;
    
    const input = userInput; 
    setUserInput('');
    const previousHistory = [...chatMessages];
    setChatMessages(prev => [...prev, { role: 'user', text: input }]);
    setChatLoading(true);
    
    try {
      const res = await chatWithChart(image, input, previousHistory);
      setChatMessages(prev => [...prev, { role: 'assistant', text: res }]);
    } catch { 
      setChatMessages(prev => [...prev, { role: 'assistant', text: "Error procesando el mensaje." }]); 
    } finally { 
      setChatLoading(false); 
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
      screenshot: image || undefined,
      outcome: 'Pending'
    };
    onSaveRecord(record);
    setFiledToday(true);
  };

  const updateOutcome = (record: DailyDirection, outcome: DailyDirection['outcome']) => {
    const updated = { ...record, outcome };
    onUpdateRecord(updated);
    if (viewingRecord?.id === record.id) setViewingRecord(updated);
  };

  const getBiasStyles = (bias: string) => {
    switch (bias) {
      case 'Bullish': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <ArrowUpCircle className="text-emerald-400" size={48} />, label: t.bias_bullish };
      case 'Bearish': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: <ArrowDownCircle className="text-rose-400" size={48} />, label: t.bias_bearish };
      default: return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <MinusCircle className="text-amber-400" size={48} />, label: t.bias_neutral };
    }
  };

  const getOutcomeStyles = (outcome?: string) => {
    switch (outcome) {
      case 'Correct': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <CheckCircle2 size={12} />, label: t.outcome_correct };
      case 'Incorrect': return { color: 'text-rose-400', bg: 'bg-rose-500/10', icon: <XCircle size={12} />, label: t.outcome_incorrect };
      case 'Invalidated': return { color: 'text-gray-400', bg: 'bg-gray-500/10', icon: <AlertTriangle size={12} />, label: t.outcome_invalidated };
      default: return { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <HelpCircle size={12} />, label: t.outcome_pending };
    }
  };

  // Accuracy Statistics
  const stats = history.reduce((acc, rec) => {
    if (rec.outcome === 'Correct') acc.correct++;
    if (rec.outcome === 'Incorrect') acc.incorrect++;
    if (rec.outcome === 'Invalidated') acc.invalidated++;
    if (rec.outcome && rec.outcome !== 'Pending') acc.totalVerified++;
    return acc;
  }, { correct: 0, incorrect: 0, invalidated: 0, totalVerified: 0 });

  const accuracy = stats.totalVerified > 0 ? (stats.correct / stats.totalVerified) * 100 : 0;

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20 px-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 theme-bg-accent rounded-xl shadow-lg shadow-indigo-600/20"><Sparkles className="w-5 h-5 text-white" /></div>
            <h2 className="text-3xl font-black tracking-tight uppercase">{t.direction}</h2>
          </div>
          <p className="theme-text-s text-sm font-medium">Gemini 3 Pro Analysis & Track Record</p>
        </div>

        {history.length > 0 && (
          <div className="bg-[#111] border theme-border p-4 rounded-2xl flex items-center gap-6 shadow-xl">
            <div className="flex flex-col">
              <span className="text-[9px] font-black theme-text-s uppercase tracking-widest">{t.analysis_accuracy}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-black ${accuracy >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {accuracy.toFixed(1)}%
                </span>
                <div className="w-24 h-1.5 bg-black rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${accuracy >= 60 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${accuracy}%` }} />
                </div>
              </div>
            </div>
            <div className="w-px h-8 bg-[#222]" />
            <div className="text-right">
              <span className="text-[9px] font-black theme-text-s uppercase tracking-widest">Logs</span>
              <p className="text-lg font-black theme-text-p">{history.length}</p>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-6">
          <div className="relative theme-bg-sidebar border-2 border-dashed rounded-[2.5rem] overflow-hidden aspect-video flex items-center justify-center p-4">
            {image ? <img src={image} className="absolute inset-0 w-full h-full object-contain p-2" alt="Chart" /> : (
              <label className="flex flex-col items-center justify-center cursor-pointer group">
                <Camera className="theme-text-s mb-6" size={32} />
                <h4 className="text-lg font-bold">{t.upload_screenshot}</h4>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </div>
          <button disabled={!image || loading} onClick={startAnalysis} className="w-full py-5 theme-bg-accent text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest">{loading ? <Loader2 className="animate-spin" /> : t.analyze}</button>
          
          {result && (
            <div className="theme-bg-sidebar border theme-border p-6 rounded-[2rem] space-y-6 animate-in slide-in-from-bottom-4">
              <div className="h-64 overflow-y-auto custom-scrollbar pr-2 space-y-4 text-xs">
                 {chatMessages.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'theme-bg-accent text-white' : 'theme-bg-app border theme-border'}`}>{msg.text}</div>
                   </div>
                 ))}
                 <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="relative">
                <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="..." className="w-full theme-bg-app border theme-border rounded-xl py-3 pl-4 outline-none" />
                <button type="submit" disabled={chatLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 theme-accent disabled:opacity-30">
                  {chatLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="xl:col-span-8 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`md:col-span-2 p-8 rounded-[2.5rem] border ${getBiasStyles(result.bias).border} ${getBiasStyles(result.bias).bg} flex flex-col items-center text-center shadow-2xl`}>
                  {getBiasStyles(result.bias).icon}
                  <h3 className={`text-6xl font-black uppercase tracking-tighter ${getBiasStyles(result.bias).color}`}>{getBiasStyles(result.bias).label}</h3>
                  <div className="mt-8 flex gap-8">
                    <div className="flex flex-col items-center"><span className="text-[9px] font-black uppercase tracking-widest opacity-60">Confidence</span><span className="text-xl font-black">{result.confidence * 10}%</span></div>
                    <div className="flex flex-col items-center"><span className="text-[9px] font-black uppercase tracking-widest opacity-60">Model</span><span className="text-xl font-black">Pro</span></div>
                  </div>
                </div>
                <div className="theme-bg-sidebar border theme-border p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 bg-gradient-to-br from-[#111] to-black">
                   <Target className="text-indigo-400" size={32} />
                   <div>
                     <span className="text-[9px] font-black theme-text-s uppercase tracking-widest">Protocol</span>
                     <p className="text-sm font-bold theme-text-p uppercase mt-1">Matrix Analysis Active</p>
                   </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="theme-bg-sidebar border theme-border p-8 rounded-[2.5rem] space-y-6">
                  <h4 className="text-[10px] font-black uppercase theme-accent tracking-widest flex items-center gap-2"><Info size={14} /> {t.execution_notes}</h4>
                  <p className="text-sm font-medium leading-relaxed opacity-90">{result.reasoning}</p>
                </div>
                <div className="theme-bg-sidebar border theme-border p-8 rounded-[2.5rem] space-y-6">
                  <h4 className="text-[10px] font-black uppercase theme-accent tracking-widest flex items-center gap-2"><Target size={14} /> Key Levels</h4>
                  <ul className="space-y-2">
                    {result.keyLevels.map((lvl, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-xs font-mono bg-black/40 p-3 rounded-xl border theme-border hover:border-indigo-500/30 transition-all">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {lvl}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                {!filedToday ? (
                  <button onClick={fileAnalysis} className="flex items-center gap-3 px-8 py-4 theme-bg-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all active:scale-95">
                    <Save size={16} /> Save Daily Bias
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                    <CheckCircle2 size={16} /> Saved to Archives
                  </div>
                )}
              </div>
            </div>
          ) : <div className="h-full min-h-[500px] flex flex-col items-center justify-center theme-text-s opacity-20 text-center gap-4">
            <TrendingUp size={64} />
            <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Technical Input</p>
          </div>}
        </div>
      </div>

      {/* Historical Archives */}
      <div className="pt-20 space-y-8 border-t theme-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 theme-bg-accent rounded-full" />
            <h3 className="text-2xl font-black uppercase tracking-tight">Directional Archives</h3>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
               <span className="text-[9px] font-black text-emerald-500 uppercase">{stats.correct} {t.outcome_correct}</span>
             </div>
             <div className="flex items-center gap-2 bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10">
               <span className="text-[9px] font-black text-rose-500 uppercase">{stats.incorrect} {t.outcome_incorrect}</span>
             </div>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {history.map(record => {
              const oStyles = getOutcomeStyles(record.outcome);
              const bStyles = getBiasStyles(record.bias);
              return (
                <div 
                  key={record.id} 
                  onClick={() => setViewingRecord(record)}
                  className="theme-bg-sidebar border theme-border rounded-[2rem] overflow-hidden flex flex-col group hover:border-indigo-500/50 transition-all cursor-pointer relative shadow-lg"
                >
                  <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-1.5 ${oStyles.bg} ${oStyles.color}`}>
                    {oStyles.icon}
                    <span className="text-[9px] font-black uppercase tracking-widest">{oStyles.label}</span>
                  </div>
                  
                  {record.screenshot && (
                    <div className="h-32 w-full overflow-hidden border-b theme-border relative">
                      <img src={record.screenshot} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" alt="Chart" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                    </div>
                  )}
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="theme-text-s" />
                          <span className="text-[10px] font-black theme-text-s uppercase font-mono">{record.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black uppercase tracking-tight ${bStyles.color}`}>{bStyles.label}</span>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteRecord(record.id); }} className="theme-text-s hover:text-rose-500 transition-colors p-1"><Trash2 size={14} /></button>
                    </div>
                    <div className="flex gap-1">
                      {record.keyLevels.slice(0, 2).map((l, i) => (
                        <span key={i} className="text-[8px] font-mono font-bold bg-black/40 px-2 py-1 rounded-md theme-border border">{l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="theme-bg-sidebar border theme-border rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center opacity-30">
            <History size={48} className="theme-text-s mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest theme-text-s">Empty Archives</p>
          </div>
        )}
      </div>

      {/* Record Viewer with Outcome Verification */}
      {viewingRecord && (
        <div className="fixed inset-0 z-[150] bg-black/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 overflow-y-auto">
          <div className="theme-bg-sidebar border theme-border rounded-[3rem] w-full max-w-7xl shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-in zoom-in duration-300">
            
            <div className="lg:w-3/5 bg-black relative flex items-center justify-center p-4 border-b lg:border-b-0 lg:border-r theme-border">
               {viewingRecord.screenshot ? <img src={viewingRecord.screenshot} className="max-h-[75vh] w-full object-contain rounded-2xl" alt="Chart" /> : (
                 <div className="h-64 flex flex-col items-center justify-center theme-text-s">
                   <Camera size={48} className="mb-4" />
                   <p className="text-xs font-black uppercase tracking-widest">No Visual Record</p>
                 </div>
               )}
            </div>

            <div className="lg:w-2/5 p-12 flex flex-col relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setViewingRecord(null)} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full theme-text-s hover:theme-text-p transition-all"><X size={24} /></button>

              <div className="space-y-10 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] theme-text-s">{viewingRecord.date}</span>
                    <div className={`px-4 py-1 rounded-full border flex items-center gap-2 ${getOutcomeStyles(viewingRecord.outcome).bg} ${getOutcomeStyles(viewingRecord.outcome).color} border-white/5`}>
                      {getOutcomeStyles(viewingRecord.outcome).icon}
                      <span className="text-[10px] font-black uppercase tracking-widest">{getOutcomeStyles(viewingRecord.outcome).label}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-6 p-8 rounded-[2.5rem] border ${getBiasStyles(viewingRecord.bias).border} ${getBiasStyles(viewingRecord.bias).bg}`}>
                    {getBiasStyles(viewingRecord.bias).icon}
                    <h3 className={`text-4xl font-black uppercase tracking-tight ${getBiasStyles(viewingRecord.bias).color}`}>{getBiasStyles(viewingRecord.bias).label}</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest theme-accent flex items-center gap-2"><Info size={14} /> Analysis Logic</h4>
                  <p className="text-base theme-text-p leading-relaxed font-medium">{viewingRecord.reasoning}</p>
                </div>

                {/* Outcome Verification Section */}
                <div className="space-y-4 p-8 theme-bg-app border theme-border rounded-[2rem] shadow-inner">
                   <div className="flex flex-col gap-1 mb-2">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] theme-text-p">{t.verify_outcome}</h4>
                     <p className="text-[10px] theme-text-s font-medium">{t.outcome_desc}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => updateOutcome(viewingRecord, 'Correct')}
                        className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex flex-col items-center gap-2 ${
                          viewingRecord.outcome === 'Correct' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-[#1a1a1a] border-[#222] text-gray-400 hover:border-emerald-500/50'
                        }`}
                      >
                        <CheckCircle2 size={18} />
                        {t.outcome_correct}
                      </button>
                      <button 
                        onClick={() => updateOutcome(viewingRecord, 'Incorrect')}
                        className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex flex-col items-center gap-2 ${
                          viewingRecord.outcome === 'Incorrect' ? 'bg-rose-500 border-rose-400 text-white' : 'bg-[#1a1a1a] border-[#222] text-gray-400 hover:border-rose-500/50'
                        }`}
                      >
                        <XCircle size={18} />
                        {t.outcome_incorrect}
                      </button>
                      <button 
                        onClick={() => updateOutcome(viewingRecord, 'Invalidated')}
                        className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex flex-col items-center gap-2 ${
                          viewingRecord.outcome === 'Invalidated' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-[#1a1a1a] border-[#222] text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <AlertTriangle size={18} />
                        {t.outcome_invalidated}
                      </button>
                      <button 
                        onClick={() => updateOutcome(viewingRecord, 'Pending')}
                        className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex flex-col items-center gap-2 ${
                          viewingRecord.outcome === 'Pending' ? 'bg-amber-500 border-amber-400 text-white' : 'bg-[#1a1a1a] border-[#222] text-gray-400 hover:border-amber-500/50'
                        }`}
                      >
                        <HelpCircle size={18} />
                        {t.outcome_pending}
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2"><Target size={14} /> Key Price Levels</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingRecord.keyLevels.map((level, idx) => (
                      <span key={idx} className="bg-black border theme-border px-5 py-3 rounded-2xl text-sm font-bold theme-text-p font-mono shadow-lg">{level}</span>
                    ))}
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
