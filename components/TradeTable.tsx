
import React, { useState } from 'react';
import { Trade, TradeSide, Account } from '../types';
import { Trash2, Shield, User, CreditCard, Table as TableIcon, ChevronDown, FileText, Image as ImageIcon, MapPin, Target, LayoutPanelTop, BookOpenText } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
  onDelete: (id: string) => void;
  accounts: Account[];
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, onDelete, accounts }) => {
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

  const getAccountInfo = (name: string) => {
    return accounts.find(a => a.name === name);
  };

  const toggleExpand = (id: string) => {
    setExpandedTradeId(expandedTradeId === id ? null : id);
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-4 md:p-6 border-b border-[#222222] flex justify-between items-center bg-black/20">
        <h3 className="text-base md:text-lg font-bold tracking-tight uppercase">Trade Journal</h3>
        <span className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full">
          {trades.length} entries
        </span>
      </div>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
        <table className="w-full text-left min-w-[700px] border-collapse">
          <thead className="bg-black text-gray-600 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black">
            <tr>
              <th className="px-4 md:px-6 py-4 md:py-6 w-10"></th>
              <th className="px-4 md:px-6 py-4 md:py-6">Date</th>
              <th className="px-4 md:px-6 py-4 md:py-6">Instrument</th>
              <th className="px-4 md:px-6 py-4 md:py-6">Account</th>
              <th className="px-4 md:px-6 py-4 md:py-6">Direction</th>
              <th className="px-4 md:px-6 py-4 md:py-6">P/L ($)</th>
              <th className="px-4 md:px-6 py-4 md:py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {trades.length > 0 ? (
              trades.map((trade) => {
                const acc = getAccountInfo(trade.accountType);
                const isExpanded = expandedTradeId === trade.id;
                
                return (
                  <React.Fragment key={trade.id}>
                    <tr 
                      onClick={() => toggleExpand(trade.id)}
                      className={`transition-all group cursor-pointer ${
                        isExpanded ? 'bg-indigo-600/5' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <ChevronDown 
                          size={16} 
                          className={`text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-400' : ''}`} 
                        />
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5 text-[10px] md:text-xs text-gray-500 font-mono">
                        {trade.date}
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center border transition-colors shrink-0 ${
                            isExpanded ? 'border-indigo-500/50' : 'border-transparent group-hover:border-[#333]'
                          }`}>
                            <span className="text-[9px] text-gray-400 font-black uppercase">{trade.instrument.slice(0, 2)}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-white tracking-tight truncate text-sm md:text-base">{trade.instrument}</span>
                            <span className="text-[8px] md:text-[9px] text-gray-600 uppercase font-black tracking-widest">{trade.marketType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase border tracking-widest ${
                          acc?.type === 'Capital' || acc?.type === 'Challenge'
                            ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' 
                            : 'bg-indigo-500/5 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {acc?.type === 'Personal' && <User size={10} />}
                          {(acc?.type === 'Capital' || acc?.type === 'Challenge') && <Shield size={10} />}
                          {!acc && <CreditCard size={10} />}
                          <span className="truncate max-w-[80px] md:max-w-[120px]">{trade.accountType}</span>
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <span className={`text-[8px] md:text-[9px] font-black px-2 py-1 rounded-md tracking-[0.2em] uppercase border ${
                          trade.side === TradeSide.LONG ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/5 text-rose-500 border-rose-500/20'
                        }`}>
                          {trade.side}
                        </span>
                      </td>
                      <td className={`px-4 md:px-6 py-4 md:py-5 font-mono font-black text-xs md:text-sm ${
                        trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(trade.id); }}
                          className="text-gray-700 hover:text-rose-500 transition-all p-2 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Content Area (Accordion Effect) */}
                    {isExpanded && (
                      <tr className="bg-[#151515] border-l-2 border-l-indigo-500">
                        <td colSpan={7} className="px-0 py-0 overflow-hidden">
                           <div className="animate-in slide-in-from-top-4 fade-in duration-300 px-8 py-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Left: Metadata & Notes */}
                                <div className="space-y-8">
                                  <div className="flex items-center gap-3">
                                    <LayoutPanelTop className="text-indigo-400" size={18} />
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trade Deconstruction</h4>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-black/40 rounded-3xl border border-[#222] shadow-inner">
                                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <MapPin size={12} className="text-indigo-500" /> Matrix
                                      </p>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-[11px]">
                                          <span className="text-gray-500">Entry</span>
                                          <span className="font-mono text-white font-bold">{trade.entryPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                          <span className="text-gray-500">Exit</span>
                                          <span className="font-mono text-white font-bold">{trade.exitPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                          <span className="text-gray-500">Size</span>
                                          <span className="font-mono text-white font-bold">{trade.size} Lots</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="p-5 bg-black/40 rounded-3xl border border-[#222] shadow-inner">
                                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Target size={12} className="text-emerald-500" /> Stats
                                      </p>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-[11px]">
                                          <span className="text-gray-500">Net P/L</span>
                                          <span className={`font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            ${trade.pnl.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                          <span className="text-gray-500">Return</span>
                                          <span className="font-mono text-white font-bold">
                                            {((Math.abs(trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100).toFixed(2)}%
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                      <BookOpenText size={14} className="text-indigo-400" /> Psychology & Execution Notes
                                    </h4>
                                    <div className="p-6 bg-black/40 border border-[#222] rounded-3xl min-h-[140px] relative">
                                      <div className="absolute top-4 right-4 opacity-5">
                                        <FileText size={48} />
                                      </div>
                                      <p className="text-sm text-gray-300 leading-relaxed font-medium italic relative z-10">
                                        {trade.notes || "No narrative was filed for this transaction. Consider adding emotional context next time."}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Visual Proof */}
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                      <ImageIcon size={14} className="text-amber-400" /> Chart Proof
                                    </h4>
                                    {trade.screenshot && (
                                      <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
                                        Visual Active
                                      </span>
                                    )}
                                  </div>
                                  <div className="aspect-video bg-black/40 border border-[#222] rounded-[2.5rem] overflow-hidden relative group shadow-2xl">
                                    {trade.screenshot ? (
                                      <img 
                                        src={trade.screenshot} 
                                        className="w-full h-full object-contain p-4 group-hover:scale-[1.02] transition-transform duration-500" 
                                        alt="Trade execution chart"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                                        <ImageIcon size={64} className="mb-4" />
                                        <span className="text-xs font-black uppercase tracking-[0.2em]">No Screenshot Available</span>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-center text-gray-600 font-bold uppercase tracking-widest">
                                    Evidence for {trade.instrument} Execution • {trade.date}
                                  </p>
                                </div>
                              </div>
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <TableIcon size={48} />
                    <p className="text-sm font-bold uppercase tracking-widest">No Activity Recorded</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeTable;
