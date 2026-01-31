
import React from 'react';
import { Trade, TradeSide, Account } from '../types';
import { Trash2, Shield, User, CreditCard, Table as TableIcon } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
  onDelete: (id: string) => void;
  accounts: Account[];
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, onDelete, accounts }) => {
  const getAccountInfo = (name: string) => {
    return accounts.find(a => a.name === name);
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
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-black text-gray-600 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black">
            <tr>
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
                return (
                  <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 md:px-6 py-4 md:py-5 text-[10px] md:text-xs text-gray-500 font-mono">{trade.date}</td>
                    <td className="px-4 md:px-6 py-4 md:py-5">
                      <div className="flex items-center gap-3">
                        {trade.screenshot ? (
                          <div className="w-8 h-8 rounded-lg bg-black border border-[#333] overflow-hidden group-hover:border-indigo-500/50 transition-colors shrink-0">
                            <img src={trade.screenshot} className="w-full h-full object-cover" alt="Preview" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center border border-transparent group-hover:border-[#333] shrink-0">
                            <span className="text-[9px] text-gray-600 font-black uppercase">{trade.instrument.slice(0, 2)}</span>
                          </div>
                        )}
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
                        onClick={() => onDelete(trade.id)}
                        className="text-gray-700 hover:text-rose-500 transition-all p-2 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-24 text-center">
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
