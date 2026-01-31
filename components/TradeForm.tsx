
import React, { useState } from 'react';
import { MarketType, TradeSide, Trade, Account } from '../types';

interface TradeFormProps {
  onSubmit: (trade: Trade) => void;
  onCancel: () => void;
  accounts: Account[];
}

const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, onCancel, accounts }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    instrument: '',
    marketType: MarketType.FUTURES,
    accountType: accounts[0]?.name || '',
    side: TradeSide.LONG,
    entryPrice: '',
    exitPrice: '',
    size: '',
    pnl: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculatePnL = () => {
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const size = parseFloat(formData.size);
    
    if (isNaN(entry) || isNaN(exit) || isNaN(size)) return;

    let pnl = 0;
    pnl = formData.side === TradeSide.LONG ? (exit - entry) * size : (entry - exit) * size;
    setFormData(prev => ({ ...prev, pnl: pnl.toFixed(2) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.instrument || !formData.entryPrice || !formData.exitPrice || !formData.pnl || !formData.accountType) {
      alert("Please fill in all required fields.");
      return;
    }

    const trade: Trade = {
      id: crypto.randomUUID(),
      date: formData.date,
      instrument: formData.instrument,
      marketType: formData.marketType,
      accountType: formData.accountType,
      side: formData.side,
      entryPrice: parseFloat(formData.entryPrice),
      exitPrice: parseFloat(formData.exitPrice),
      size: parseFloat(formData.size) || 1,
      pnl: parseFloat(formData.pnl),
      notes: formData.notes
    };

    onSubmit(trade);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl mb-4">
        <label className="text-xs text-indigo-400 font-bold uppercase tracking-widest block mb-3">Destination Account</label>
        <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, accountType: acc.name }))}
              className={`py-3 px-3 rounded-lg font-medium transition-all text-[11px] border text-center ${
                formData.accountType === acc.name 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                : 'bg-[#1a1a1a] text-gray-500 border-[#333] hover:border-[#444]'
              }`}
            >
              {acc.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">Market Type</label>
          <select 
            name="marketType" 
            value={formData.marketType} 
            onChange={handleChange}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value={MarketType.FOREX}>Forex</option>
            <option value={MarketType.FUTURES}>Futures</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">Trade Date</label>
          <input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">Instrument</label>
          <input 
            type="text" 
            name="instrument" 
            placeholder="e.g. NQ, ES, EURUSD"
            value={formData.instrument} 
            onChange={handleChange}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">Direction</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, side: TradeSide.LONG }))}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                formData.side === TradeSide.LONG 
                ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/50' 
                : 'bg-[#1a1a1a] text-gray-500 border border-[#333]'
              }`}
            >
              Long
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, side: TradeSide.SHORT }))}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                formData.side === TradeSide.SHORT 
                ? 'bg-rose-600/20 text-rose-500 border border-rose-500/50' 
                : 'bg-[#1a1a1a] text-gray-500 border border-[#333]'
              }`}
            >
              Short
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">Entry</label>
          <input 
            type="number" 
            step="any"
            name="entryPrice" 
            value={formData.entryPrice} 
            onChange={handleChange}
            onBlur={calculatePnL}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">Exit</label>
          <input 
            type="number" 
            step="any"
            name="exitPrice" 
            value={formData.exitPrice} 
            onChange={handleChange}
            onBlur={calculatePnL}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">Quantity</label>
          <input 
            type="number" 
            step="any"
            name="size" 
            value={formData.size} 
            onChange={handleChange}
            onBlur={calculatePnL}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
          />
        </div>
      </div>

      <div className="p-4 bg-[#141414] rounded-xl border border-[#333]">
        <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Calculated Profit / Loss ($)</label>
        <input 
          type="number" 
          step="any"
          name="pnl" 
          value={formData.pnl} 
          onChange={handleChange}
          className={`w-full bg-transparent text-2xl font-black outline-none font-mono ${
            parseFloat(formData.pnl) >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400 font-medium">Execution Notes</label>
        <textarea 
          name="notes" 
          rows={3}
          value={formData.notes} 
          onChange={handleChange}
          placeholder="Emotion state, execution quality..."
          className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
        />
      </div>

      <div className="flex gap-4 pt-2">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-4 px-4 border border-[#333] rounded-xl hover:bg-white/5 transition-colors font-medium text-gray-400"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="flex-1 py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-600/20"
        >
          Log Trade
        </button>
      </div>
    </form>
  );
};

export default TradeForm;
