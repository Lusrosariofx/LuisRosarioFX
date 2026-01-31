
import React from 'react';
import { Trade } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Target } from 'lucide-react';

interface TradeCalendarProps {
  trades: Trade[];
}

const TradeCalendar: React.FC<TradeCalendarProps> = ({ trades }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => null);

  const getTradesForDay = (day: number) => {
    // Standardize to YYYY-MM-DD
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return trades.filter(t => t.date === dateStr);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const goToToday = () => setCurrentDate(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
            <CalendarIcon className="text-indigo-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-baseline gap-2">
              {currentDate.toLocaleString('default', { month: 'long' })}
              <span className="text-gray-600 font-normal text-lg">{currentDate.getFullYear()}</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium">Viewing trade distribution across the monthly cycle</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={goToToday}
            className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#222] rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:border-[#333] transition-all"
          >
            <Target size={14} />
            Today
          </button>
          <div className="flex bg-[#111] border border-[#222] rounded-xl overflow-hidden p-1 gap-1">
            <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
            <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>
      </header>

      <div className="bg-[#111] border border-[#222] rounded-[2.5rem] overflow-hidden shadow-2xl p-1">
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-600">
              {day}
            </div>
          ))}
          {[...padding, ...days].map((day, idx) => {
            if (day === null) return <div key={`pad-${idx}`} className="bg-black/20 rounded-2xl aspect-square md:aspect-auto md:min-h-[140px]" />;
            
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const dayTrades = getTradesForDay(day);
            const dailyPnl = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
            const screenshotTrade = dayTrades.find(t => !!t.screenshot);

            return (
              <div 
                key={day} 
                className={`group relative bg-[#0c0c0c] rounded-2xl aspect-square md:aspect-auto md:min-h-[140px] p-2 flex flex-col transition-all border ${
                  isToday ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-[#1a1a1a] hover:border-[#333] hover:bg-[#111]'
                }`}
              >
                <div className="flex justify-between items-start z-10">
                  <span className={`text-xs font-black p-1.5 rounded-lg w-7 h-7 flex items-center justify-center ${
                    isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-500'
                  }`}>
                    {day}
                  </span>
                  {dayTrades.length > 0 && (
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    </div>
                  )}
                </div>
                
                <div className="mt-2 space-y-1 flex-1 overflow-hidden z-10">
                  {dayTrades.slice(0, 3).map(t => (
                    <div 
                      key={t.id} 
                      className={`text-[9px] font-bold px-2 py-1 rounded-lg flex justify-between items-center backdrop-blur-md border ${
                        t.pnl >= 0 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      <span className="truncate max-w-[50%]">{t.instrument}</span>
                      <span>{t.pnl >= 0 ? '+' : ''}{Math.round(t.pnl)}</span>
                    </div>
                  ))}
                  {dayTrades.length > 3 && (
                    <div className="text-[8px] text-gray-600 font-bold text-center pt-1">
                      + {dayTrades.length - 3} more
                    </div>
                  )}
                </div>

                {dailyPnl !== 0 && (
                  <div className={`mt-auto text-[10px] font-black text-right z-10 ${
                    dailyPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {dailyPnl >= 0 ? '+$' : '-$'}{Math.abs(Math.round(dailyPnl))}
                  </div>
                )}

                {/* Background image preview if available */}
                {screenshotTrade && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-10 group-hover:opacity-40 transition-opacity duration-500">
                    <img 
                      src={screenshotTrade.screenshot} 
                      className="w-full h-full object-cover grayscale brightness-50" 
                      alt="Screenshot background"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 py-4 px-8 bg-[#111] border border-[#222] rounded-3xl">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-bold text-gray-500 uppercase">Profitable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          <span className="text-[10px] font-bold text-gray-500 uppercase">Loss</span>
        </div>
        <div className="flex items-center gap-2 border-l border-[#222] pl-8">
          <Target size={14} className="text-indigo-500" />
          <span className="text-[10px] font-bold text-gray-500 uppercase">Current Today</span>
        </div>
      </div>
    </div>
  );
};

export default TradeCalendar;
