
import React, { useState, useRef } from 'react';
import { MarketType, TradeSide, Trade, Account } from '../types';
import { ImageIcon, X, Upload } from 'lucide-react';
import { Language, translations } from '../translations';

interface TradeFormProps {
  onSubmit: (trade: Trade) => void;
  onCancel: () => void;
  accounts: Account[];
  lang: Language;
}

const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, onCancel, accounts, lang }) => {
  const t = translations[lang];
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
    notes: '',
    screenshot: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setFormData(prev => ({ ...prev, screenshot: event.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const calculatePnL = () => {
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const size = parseFloat(formData.size);
    if (isNaN(entry) || isNaN(exit) || isNaN(size)) return;
    const pnl = formData.side === TradeSide.LONG ? (exit - entry) * size : (entry - exit) * size;
    setFormData(prev => ({ ...prev, pnl: pnl.toFixed(2) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.instrument || !formData.entryPrice || !formData.exitPrice || !formData.pnl || !formData.accountType) {
      alert("Missing required fields.");
      return;
    }
    onSubmit({
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
      notes: formData.notes,
      screenshot: formData.screenshot
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl mb-4">
        <label className="text-xs text-indigo-400 font-bold uppercase tracking-widest block mb-3">{t.destination_account}</label>
        <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
          {accounts.map((acc) => (
            <button key={acc.id} type="button" onClick={() => setFormData(prev => ({ ...prev, accountType: acc.name }))} className={`py-3 px-3 rounded-lg font-medium transition-all text-[11px] border text-center ${formData.accountType === acc.name ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-[#1a1a1a] text-gray-500 border-[#333] hover:border-[#444]'}`}>{acc.name}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">{t.market_type}</label>
          <select name="marketType" value={formData.marketType} onChange={handleChange} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2.5 outline-none">
            <option value={MarketType.FOREX}>Forex</option>
            <option value={MarketType.FUTURES}>Futures</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">{t.trade_date}</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">{t.instrument}</label>
          <input type="text" name="instrument" value={formData.instrument} onChange={handleChange} placeholder="NQ, EURUSD..." className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">{t.side}</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, side: TradeSide.LONG }))} className={`flex-1 py-2 rounded-lg font-bold transition-all ${formData.side === TradeSide.LONG ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/50' : 'bg-[#1a1a1a] text-gray-500 border border-[#333]'}`}>{t.direction_long}</button>
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, side: TradeSide.SHORT }))} className={`flex-1 py-2 rounded-lg font-bold transition-all ${formData.side === TradeSide.SHORT ? 'bg-rose-600/20 text-rose-500 border border-rose-500/50' : 'bg-[#1a1a1a] text-gray-500 border border-[#333]'}`}>{t.direction_short}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1"><label className="text-sm text-gray-400 font-medium">{t.entry}</label><input type="number" step="any" name="entryPrice" value={formData.entryPrice} onChange={handleChange} onBlur={calculatePnL} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 outline-none font-mono" /></div>
        <div className="flex flex-col gap-1"><label className="text-sm text-gray-400 font-medium">{t.exit}</label><input type="number" step="any" name="exitPrice" value={formData.exitPrice} onChange={handleChange} onBlur={calculatePnL} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 outline-none font-mono" /></div>
        <div className="flex flex-col gap-1"><label className="text-sm text-gray-400 font-medium">{t.quantity}</label><input type="number" step="any" name="size" value={formData.size} onChange={handleChange} onBlur={calculatePnL} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 outline-none font-mono" /></div>
      </div>

      <div className="p-4 bg-[#141414] rounded-xl border border-[#333]">
        <label className="text-xs text-gray-500 uppercase font-bold block mb-1">{t.calculated_pnl}</label>
        <input type="number" step="any" name="pnl" value={formData.pnl} onChange={handleChange} className={`w-full bg-transparent text-2xl font-black outline-none font-mono ${parseFloat(formData.pnl) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">{t.execution_notes}</label>
          <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} placeholder={t.notes_placeholder} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 outline-none text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">{t.upload_screenshot}</label>
          {formData.screenshot ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#333] bg-black">
              <img src={formData.screenshot} className="w-full h-full object-contain" alt="Preview" />
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, screenshot: '' }))} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full"><X size={14} /></button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-6 bg-[#1a1a1a] border border-[#333] border-dashed rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-gray-500 hover:text-indigo-400">
              <Upload size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.upload_screenshot}</span>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-4 border border-[#333] rounded-xl text-gray-400">{t.cancel}</button>
        <button type="submit" className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">{t.log_trade}</button>
      </div>
    </form>
  );
};

export default TradeForm;
