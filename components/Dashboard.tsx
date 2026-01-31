
import React from 'react';
import { TradeMetrics, Trade, Account } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Percent, TrendingUp, Shield, Wallet, Activity } from 'lucide-react';

interface DashboardProps {
  metrics: TradeMetrics;
  trades: Trade[];
  allTrades: Trade[];
  accounts: Account[];
}

const Dashboard: React.FC<DashboardProps> = ({ metrics, trades, allTrades, accounts }) => {
  const chartData = React.useMemo(() => {
    let runningPnl = 0;
    return [...trades].reverse().map((t, idx) => {
      runningPnl += t.pnl;
      return {
        name: idx + 1,
        equity: runningPnl
      };
    });
  }, [trades]);

  const accountBreakdown = React.useMemo(() => {
    return accounts.map(acc => {
      const pnl = allTrades.filter(t => t.accountType === acc.name).reduce((sum, t) => sum + t.pnl, 0);
      return {
        name: acc.name,
        value: Math.max(0, pnl), // For pie chart visibility
        realValue: pnl
      };
    }).filter(acc => acc.realValue !== 0 || accounts.length < 5); // Filter out zero pnl if too many accounts
  }, [allTrades, accounts]);

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Trading Dashboard</h2>
          <p className="text-gray-400 text-sm">Professional real-time performance tracking.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111] border border-[#222] p-1.5 rounded-2xl">
          <div className="px-4 py-1.5 flex flex-col items-center">
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Global P/L</span>
            <span className={`text-sm font-bold ${allTrades.reduce((acc, t) => acc + t.pnl, 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${allTrades.reduce((acc, t) => acc + t.pnl, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Filtered P/L" 
          value={`$${metrics.totalPnl.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
          icon={<Wallet className="text-indigo-400" />}
          trend={metrics.totalPnl >= 0 ? 'up' : 'down'}
        />
        <StatCard 
          label="Win Ratio" 
          value={`${metrics.winRate.toFixed(1)}%`} 
          icon={<Percent className="text-emerald-400" />}
          trend={metrics.winRate >= 50 ? 'up' : 'down'}
        />
        <StatCard 
          label="Efficiency Index" 
          value={metrics.profitFactor.toFixed(2)} 
          icon={<TrendingUp className="text-amber-400" />}
          trend={metrics.profitFactor >= 1.5 ? 'up' : 'down'}
        />
        <StatCard 
          label="Drawdown" 
          value={`$${metrics.maxDrawdown.toFixed(2)}`} 
          icon={<Shield className="text-rose-400" />}
          trend="neutral"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#111111] border border-[#222222] p-8 rounded-3xl h-[450px] shadow-2xl relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Equity Growth</h3>
            <span className="text-xs text-indigo-400 font-mono tracking-tighter">Performance Linear Projection</span>
          </div>
          <div className="h-[320px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                  <XAxis dataKey="name" stroke="#333" tick={{fontSize: 10}} hide />
                  <YAxis stroke="#444" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderRadius: '12px', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    labelClassName="hidden"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorEquity)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 italic">
                Awaiting more trade data for visualization.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-3xl flex flex-col items-center justify-center h-1/2">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Account Weighting</h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accountBreakdown}
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {accountBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2 mt-4 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
               {accountBreakdown.map((acc, i) => (
                 <div key={acc.name} className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-400 truncate">{acc.name}</span>
                    </div>
                    <span className={`font-mono font-bold shrink-0 ${acc.realValue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${acc.realValue.toFixed(2)}
                    </span>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-[#222222] p-6 rounded-3xl flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Trade Volume</h3>
              <div className="space-y-4">
                <DetailRow label="Total Volume" value={metrics.totalTrades} icon={<Activity size={12} className="text-indigo-400" />} />
                <DetailRow label="Win Count" value={metrics.winningTrades} color="text-emerald-400" />
                <DetailRow label="Loss Count" value={metrics.losingTrades} color="text-rose-400" />
                <DetailRow label="Avg Profit" value={`$${metrics.avgWin.toFixed(2)}`} />
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[#222222]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase font-bold text-gray-500">Sharpe Equivalent</span>
                <span className="text-[10px] font-bold text-indigo-400 tracking-tighter">{(metrics.winRate * (metrics.profitFactor / 2)).toFixed(1)} PTS</span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${Math.min(100, (metrics.winRate * metrics.profitFactor))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  label: string, 
  value: string | number, 
  icon: React.ReactNode, 
  trend: 'up' | 'down' | 'neutral' 
}> = ({ label, value, icon, trend }) => (
  <div className="bg-[#111111] border border-[#222222] p-6 rounded-3xl flex items-center justify-between group hover:border-indigo-500/30 transition-all shadow-lg">
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</p>
      <h4 className="text-xl font-black font-mono tracking-tighter">{value}</h4>
    </div>
    <div className="p-3.5 rounded-2xl bg-black/40 group-hover:scale-110 transition-transform">
      {icon}
    </div>
  </div>
);

const DetailRow: React.FC<{ label: string, value: string | number, color?: string, icon?: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="flex justify-between items-center py-1">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-gray-500 text-[10px] font-black uppercase tracking-tight">{label}</span>
    </div>
    <span className={`font-mono text-sm font-black ${color || 'text-white'}`}>{value}</span>
  </div>
);

export default Dashboard;
