
import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, X, Check, Loader2, AlertCircle, Shield, User, Files, Trash2, CheckCircle2, CreditCard } from 'lucide-react';
import { analyzeTradeImage } from '../services/geminiService';
import { Trade, Account, MarketType } from '../types';

interface ImageImportModalProps {
  onImport: (trades: Trade[]) => void;
  onClose: () => void;
  accounts: Account[];
}

interface ImageTask {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extractedData?: Partial<Trade>;
  error?: string;
}

const ImageImportModal: React.FC<ImageImportModalProps> = ({ onImport, onClose, accounts }) => {
  const [tasks, setTasks] = useState<ImageTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newTasks: ImageTask[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));

    setTasks(prev => [...prev, ...newTasks]);
  };

  const removeTask = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task) URL.revokeObjectURL(task.preview);
      return prev.filter(t => t.id !== id);
    });
  };

  const processAll = async () => {
    if (!selectedAccount || tasks.length === 0) return;
    
    setLoading(true);
    
    for (const task of tasks) {
      if (task.status === 'completed') continue;

      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'processing' } : t));

      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(task.file);
        });

        const base64 = await base64Promise;
        const data = await analyzeTradeImage(base64);

        setTasks(prev => prev.map(t => t.id === task.id ? { 
          ...t, 
          status: 'completed', 
          extractedData: data 
        } : t));
      } catch (err: any) {
        setTasks(prev => prev.map(t => t.id === task.id ? { 
          ...t, 
          status: 'error', 
          error: err.message || "Analysis failed" 
        } : t));
      }
    }
    setLoading(false);
  };

  const confirmImport = () => {
    if (!selectedAccount) return;
    
    const successfulTrades: Trade[] = tasks
      .filter(t => t.status === 'completed' && t.extractedData)
      .map(t => ({
        id: crypto.randomUUID(),
        date: t.extractedData!.date || new Date().toISOString().split('T')[0],
        instrument: t.extractedData!.instrument || 'Unknown',
        marketType: t.extractedData!.marketType || (t.extractedData!.instrument?.length! > 5 ? MarketType.FOREX : MarketType.FUTURES),
        accountType: selectedAccount,
        side: t.extractedData!.side as any,
        entryPrice: t.extractedData!.entryPrice || 0,
        exitPrice: t.extractedData!.exitPrice || 0,
        size: t.extractedData!.size || 1,
        pnl: t.extractedData!.pnl || 0,
        screenshot: t.preview, 
        notes: "Batch AI Import"
      }));

    if (successfulTrades.length > 0) {
      onImport(successfulTrades);
    }
  };

  const allCompleted = tasks.length > 0 && tasks.every(t => t.status === 'completed' || t.status === 'error');
  const someSuccess = tasks.some(t => t.status === 'completed');

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#222] rounded-[2.5rem] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Upload & Queue */}
        <div className="w-full md:w-2/3 bg-black/50 p-8 flex flex-col border-r border-[#222]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/20 rounded-xl border border-indigo-500/30">
                <Files className="text-indigo-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight uppercase">Visual Analysis</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Multi-Screenshot Processing</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {tasks.length === 0 ? (
              <label className="h-full border-2 border-dashed border-[#222] rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group p-12">
                <div className="w-20 h-20 bg-[#151515] rounded-full flex items-center justify-center mb-6 border border-[#333] group-hover:scale-110 transition-transform">
                  <ImageIcon className="text-gray-400" size={40} />
                </div>
                <h4 className="text-lg font-bold text-gray-300">Drop Screenshots Here</h4>
                <p className="text-xs text-gray-500 mt-2 text-center max-w-[250px]">Select multiple files. AI will extract instrument, P/L and date automatically.</p>
                <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
              </label>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tasks.map((task) => (
                  <div key={task.id} className={`bg-[#151515] border rounded-2xl p-4 flex gap-4 transition-all ${
                    task.status === 'processing' ? 'border-indigo-500/50 bg-indigo-500/5' : 
                    task.status === 'completed' ? 'border-emerald-500/30' : 
                    task.status === 'error' ? 'border-rose-500/30' : 'border-[#222]'
                  }`}>
                    <div className="w-16 h-16 rounded-xl bg-black border border-[#333] overflow-hidden shrink-0 relative">
                      <img src={task.preview} className="w-full h-full object-cover" alt="Trade preview" />
                      {task.status === 'processing' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="animate-spin text-indigo-500" size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase text-gray-500 truncate block pr-2">
                          {task.file.name}
                        </span>
                        {!loading && task.status === 'pending' && (
                          <button onClick={() => removeTask(task.id)} className="text-gray-600 hover:text-rose-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-1">
                        {task.status === 'completed' && task.extractedData ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{task.extractedData.instrument}</span>
                            <span className={`text-[10px] font-black ${task.extractedData.pnl! >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {task.extractedData.pnl! >= 0 ? '+' : ''}${task.extractedData.pnl?.toFixed(2)}
                            </span>
                          </div>
                        ) : task.status === 'error' ? (
                          <span className="text-[9px] text-rose-500 font-bold">{task.error}</span>
                        ) : (
                          <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{task.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {!loading && !allCompleted && (
                  <label className="border-2 border-dashed border-[#222] rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all p-4 min-h-[96px]">
                    <div className="flex flex-col items-center gap-1">
                      <ImageIcon size={20} className="text-gray-600" />
                      <span className="text-[10px] font-black text-gray-600 uppercase">Add More</span>
                    </div>
                    <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Setup & Confirmation */}
        <div className="w-full md:w-1/3 p-8 flex flex-col bg-[#0f0f0f] relative">
          <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-20">
            <X size={24} />
          </button>

          <div className="flex-1 space-y-8 pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">1</span>
                <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Target Account</label>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                {accounts.map(acc => (
                  <button
                    key={acc.id}
                    disabled={loading || allCompleted}
                    onClick={() => setSelectedAccount(acc.name)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      selectedAccount === acc.name 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                      : 'bg-black/40 border-[#222] text-gray-500 hover:border-[#333]'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedAccount === acc.name ? 'bg-white/20' : 'bg-[#151515]'}`}>
                      {acc.type === 'Personal' ? <User size={16} /> : acc.type === 'Challenge' ? <CreditCard size={16} /> : <Shield size={16} />}
                    </div>
                    <div className="text-left truncate">
                      <span className="text-[11px] font-black uppercase tracking-wider block truncate">{acc.name}</span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase">{acc.type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">2</span>
                <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Summary</label>
              </div>
              
              <div className="bg-black/40 border border-[#222] rounded-2xl p-6 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#222]">
                  <span className="text-[10px] font-black text-gray-500 uppercase">Batch Size</span>
                  <span className="text-sm font-black text-white">{tasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase">Processed</span>
                  <span className="text-xs font-black text-emerald-400">{tasks.filter(t => t.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-rose-500 uppercase">Failed</span>
                  <span className="text-xs font-black text-rose-400">{tasks.filter(t => t.status === 'error').length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-auto flex flex-col gap-3">
            {!allCompleted ? (
              <button 
                disabled={!selectedAccount || tasks.length === 0 || loading}
                onClick={processAll}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-20 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {loading ? 'Analyzing...' : 'Start Extraction'}
              </button>
            ) : (
              <button 
                disabled={!someSuccess}
                onClick={confirmImport}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-20 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <CheckCircle2 size={18} />
                Confirm {tasks.filter(t => t.status === 'completed').length} Trades
              </button>
            )}
            
            <button 
              onClick={onClose}
              disabled={loading}
              className="w-full py-4 text-gray-600 hover:text-gray-400 font-black text-[10px] uppercase tracking-widest"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageImportModal;
