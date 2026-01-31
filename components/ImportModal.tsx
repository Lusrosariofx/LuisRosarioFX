
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Info, Shield, User, CreditCard } from 'lucide-react';
import { parseMT5Report } from '../services/importService';
import { Trade, Account } from '../types';

interface ImportModalProps {
  onImport: (trades: Trade[]) => void;
  onClose: () => void;
  accounts: Account[];
}

const ImportModal: React.FC<ImportModalProps> = ({ onImport, onClose, accounts }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewTrades, setPreviewTrades] = useState<Trade[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0]?.name || '');

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    if (!file.name.toLowerCase().endsWith('.html') && !file.name.toLowerCase().endsWith('.htm')) {
      setError("Unsupported format. MT5 reports must be .html or .htm files.");
      setIsProcessing(false);
      return;
    }

    try {
      const text = await file.text();
      const trades = await parseMT5Report(text);
      
      if (trades.length === 0) {
        setError("No valid closed trades found. Ensure this is a 'History' or 'Report' export from MT5 containing a 'Closed Transactions' table.");
      } else {
        // Map the imported trades to the currently selected account
        const mappedTrades = trades.map(t => ({ ...t, accountType: selectedAccount }));
        setPreviewTrades(mappedTrades);
      }
    } catch (err) {
      console.error(err);
      setError("Critical error parsing the report.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const finalConfirm = () => {
    const finalTrades = previewTrades.map(t => ({ ...t, accountType: selectedAccount }));
    onImport(finalTrades);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#222] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#151515]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Upload className="text-amber-500 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Import MT5 Report</h2>
              <p className="text-xs text-gray-500">Bulk log closed transactions</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Target Account Selection */}
          <div className="space-y-4">
            <label className="text-xs text-gray-500 uppercase font-black tracking-widest">Select Destination Account</label>
            <div className="grid grid-cols-2 gap-2 max-h-[100px] overflow-y-auto custom-scrollbar pr-1">
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc.name)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-bold transition-all ${
                    selectedAccount === acc.name ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/40 border-[#222] text-gray-500'
                  }`}
                >
                  {acc.type === 'Personal' ? <User size={14} /> : <Shield size={14} />}
                  <span className="truncate">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {previewTrades.length === 0 ? (
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all min-h-[250px] ${
                dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-[#333] hover:border-[#444]'
              }`}
            >
              {isProcessing ? (
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-indigo-400 font-bold">Extracting Trades...</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                    <FileText className="text-gray-400 w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Upload HTML Report</h3>
                  <p className="text-gray-500 text-sm max-w-xs mb-8">
                    Drop your MT5 closed transaction report here.
                  </p>
                  
                  <label className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm cursor-pointer hover:bg-gray-200 transition-colors">
                    Browse Files
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".html,.htm" 
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
                    />
                  </label>
                </>
              )}

              {error && (
                <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-start text-left gap-2 w-full">
                  <span className="text-rose-500 font-bold text-xs">Error: {error}</span>
                  <p className="text-gray-500 text-[10px]">Ensure the file contains the 'Closed Transactions' table from MT5.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-3 rounded-2xl border border-emerald-400/20">
                <CheckCircle2 size={18} />
                <span className="text-sm font-bold">Identified {previewTrades.length} transactions</span>
              </div>
              
              <div className="bg-black/20 border border-[#222] rounded-2xl divide-y divide-[#222] max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {previewTrades.map((t, idx) => (
                  <div key={idx} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-1 h-8 rounded-full ${t.pnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div>
                        <div className="font-bold text-sm">{t.instrument}</div>
                        <div className="text-[9px] text-gray-500 font-mono uppercase">
                          {t.date} • {t.side} {t.size} Lots
                        </div>
                      </div>
                    </div>
                    <div className={`font-mono font-bold text-sm ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${t.pnl.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#222] bg-[#151515] flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 border border-[#333] rounded-xl text-gray-500 font-bold text-xs uppercase"
          >
            Cancel
          </button>
          <button 
            disabled={previewTrades.length === 0 || isProcessing}
            onClick={finalConfirm}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 text-xs uppercase"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
