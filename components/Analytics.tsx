
import React from 'react';
import { Trade } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalyticsProps {
  trades: Trade[];
}

const Analytics: React.FC<AnalyticsProps> = ({ trades }) => {
  const pnlDistribution = React.useMemo(() => {
    // Bucket P/L values
    const bins: Record<string, number> = {
      '<-500': 0,
      '-500 to -100': 0,
      '-100 to 0': 0,
      '0 to 100': 0,
      '100 to 500': 0,
      '>500': 0
    };

    trades.forEach(t => {
      if (t.pnl < -500) bins['<-500']++;
      else if (t.pnl < -100) bins['-500 to -100']++;
      else if (t.pnl < 0) bins['-100 to 0']++;
      else if (t.pnl < 100) bins['0 to 100']++;
      else if (t.pnl < 500) bins['100 to 500']++;
      else bins['>500']++;
    });

    // Added type assertion to ensure 'count' is treated as a number
    return (Object.entries(bins) as [string, number][]).map(([name, count]) => ({ name, count }));
  }, [trades]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
        <p className="text-gray-400">Deep dive into your trading data and edge.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">P/L Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" tick={{fontSize: 10}} />
                <YAxis stroke="#555" tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                />
                <Bar dataKey="count">
                  {pnlDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name.includes('-') || entry.name.includes('<') ? '#f43f5e' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Performance by Instrument</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {/* Added type assertion [string, number][] to fix arithmetic and unknown type errors on pnl values */}
            {(Object.entries(
              trades.reduce((acc, t) => {
                acc[t.instrument] = (acc[t.instrument] || 0) + t.pnl;
                return acc;
              }, {} as Record<string, number>)
            ) as [string, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([symbol, pnl]) => (
              <div key={symbol} className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
                <span className="font-semibold">{symbol}</span>
                <span className={`font-mono font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${pnl.toFixed(2)}
                </span>
              </div>
            ))}
            {trades.length === 0 && <p className="text-gray-500 text-center py-8">No data available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
