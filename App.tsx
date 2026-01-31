
import React, { useState, useEffect, useMemo } from 'react';
import { MarketType, TradeSide, Trade, TradeMetrics, Account } from './types';
import TradeForm from './components/TradeForm';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import AIInsights from './components/AIInsights';
import ImportModal from './components/ImportModal';
import ImageImportModal from './components/ImageImportModal';
import DirectionAssistant from './components/DirectionAssistant';
import TradeTable from './components/TradeTable';
import TradeCalendar from './components/TradeCalendar';
import { 
  LayoutDashboard, 
  BarChart3, 
  BrainCircuit, 
  PlusCircle, 
  TrendingUp,
  Filter,
  Camera,
  Plus,
  X,
  Target,
  Trash2,
  Menu,
  Download,
  Database,
  Zap,
  Shield,
  User,
  CreditCard,
  Settings2,
  FileText,
  NotebookPen
} from 'lucide-react';

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'personal-1', name: 'Personal Capital', type: 'Personal' },
  { id: 'capital-1', name: 'Just Capital', type: 'Capital' }
];

const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'journal' | 'direction'>('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showImageImport, setShowImageImport] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accountFilter, setAccountFilter] = useState<string | 'ALL'>('ALL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistence
  useEffect(() => {
    const savedTrades = localStorage.getItem('trade_track_pro_trades');
    const savedAccounts = localStorage.getItem('trade_track_pro_accounts');
    
    if (savedTrades) {
      try { setTrades(JSON.parse(savedTrades)); } catch (e) { console.error(e); }
    }
    if (savedAccounts) {
      try { 
        const parsedAccounts = JSON.parse(savedAccounts);
        if (parsedAccounts && parsedAccounts.length > 0) {
          setAccounts(parsedAccounts);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trade_track_pro_trades', JSON.stringify(trades));
    localStorage.setItem('trade_track_pro_accounts', JSON.stringify(accounts));
  }, [trades, accounts]);

  const filteredTrades = useMemo(() => {
    if (accountFilter === 'ALL') return trades;
    return trades.filter(t => t.accountType === accountFilter);
  }, [trades, accountFilter]);

  const calculateMetrics = (tradeSet: Trade[]): TradeMetrics => {
    const totalTrades = tradeSet.length;
    if (totalTrades === 0) {
      return {
        totalPnl: 0, winRate: 0, profitFactor: 0, totalTrades: 0,
        winningTrades: 0, losingTrades: 0, avgWin: 0, avgLoss: 0, maxDrawdown: 0
      };
    }

    const winningTrades = tradeSet.filter(t => t.pnl > 0);
    const losingTrades = tradeSet.filter(t => t.pnl < 0);
    const totalPnl = tradeSet.reduce((acc, t) => acc + t.pnl, 0);
    const totalWinPnl = winningTrades.reduce((acc, t) => acc + t.pnl, 0);
    const totalLossPnl = Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0));

    let maxEquity = 0;
    let currentEquity = 0;
    let maxDD = 0;
    [...tradeSet].reverse().forEach(t => {
      currentEquity += t.pnl;
      if (currentEquity > maxEquity) maxEquity = currentEquity;
      const dd = maxEquity - currentEquity;
      if (dd > maxDD) maxDD = dd;
    });

    return {
      totalPnl,
      winRate: (winningTrades.length / totalTrades) * 100,
      profitFactor: totalLossPnl === 0 ? totalWinPnl : totalWinPnl / totalLossPnl,
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      avgWin: winningTrades.length > 0 ? totalWinPnl / winningTrades.length : 0,
      avgLoss: losingTrades.length > 0 ? totalLossPnl / losingTrades.length : 0,
      maxDrawdown: maxDD
    };
  };

  const metrics = useMemo(() => calculateMetrics(filteredTrades), [filteredTrades]);

  const addTrades = (newTrades: Trade | Trade[]) => {
    const tradeArray = Array.isArray(newTrades) ? newTrades : [newTrades];
    setTrades(prev => [...tradeArray, ...prev]);
    setShowAddForm(false);
    setShowImageImport(false);
    setActiveTab('journal');
  };

  const addAccount = (name: string, type: Account['type']) => {
    const newAcc: Account = {
      id: crypto.randomUUID(),
      name,
      type
    };
    setAccounts(prev => [...prev, newAcc]);
    setShowAddAccount(false);
  };

  const deleteAccount = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This account's trades will stay in your journal but will be tagged "Account Deleted".`)) {
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      if (accountFilter === name) {
        setAccountFilter('ALL');
      }
    }
  };

  const exportData = () => {
    const data = {
      trades,
      accounts,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradetrack_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.trades && data.accounts) {
          if (window.confirm("This will replace your current data with the backup. Continue?")) {
            setTrades(data.trades);
            setAccounts(data.accounts);
            alert("Data restored successfully!");
          }
        }
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleBulkImport = (newTrades: Trade[]) => {
    setTrades(prev => [...newTrades, ...prev]);
    setShowImport(false);
    setActiveTab('journal');
  };

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#111] border-b border-[#222] sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-indigo-500 w-6 h-6" />
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight leading-none">TradeTrack<span className="text-indigo-500">Pro</span></h1>
            <p className="text-[7px] font-black tracking-[0.2em] text-gray-500 uppercase mt-0.5">DIRECTIONDAY</p>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-0 z-[55] md:relative md:flex w-full md:w-72 bg-[#111111] border-r border-[#222222] p-6 flex flex-col gap-8 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col gap-1 select-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight">TradeTrack<span className="text-indigo-500">Pro</span></h1>
          </div>
          <p className="text-[9px] font-black tracking-[0.4em] text-gray-500 uppercase ml-1 mt-1 opacity-70">DIRECTIONDAY</p>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem active={activeTab === 'journal'} onClick={() => { setActiveTab('journal'); setIsSidebarOpen(false); }} icon={<NotebookPen size={20} />} label="Journal & AI" />
          <NavItem active={activeTab === 'direction'} onClick={() => { setActiveTab('direction'); setIsSidebarOpen(false); }} icon={<Zap size={20} />} label="Daily Direction" />
          <NavItem active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} icon={<BarChart3 size={20} />} label="Performance" />
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] text-gray-500 uppercase font-black flex items-center gap-2 tracking-wider">
                <Filter size={12} /> Accounts
              </label>
              <button 
                onClick={() => setShowAddAccount(true)}
                className="p-1 hover:bg-white/10 rounded-md text-indigo-400 transition-colors"
                title="Add New Account"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
              <FilterButton 
                active={accountFilter === 'ALL'} 
                onClick={() => { setAccountFilter('ALL'); setIsSidebarOpen(false); }} 
                label="All Accounts" 
              />
              {accounts.map(acc => (
                <FilterButton 
                  key={acc.id} 
                  active={accountFilter === acc.name} 
                  onClick={() => { setAccountFilter(acc.name); setIsSidebarOpen(false); }} 
                  onDelete={() => deleteAccount(acc.id, acc.name)}
                  label={acc.name} 
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => { setShowImageImport(true); setIsSidebarOpen(false); }}
                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group"
              >
                <Camera size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase tracking-widest font-black">Analyze</span>
              </button>
              <button 
                onClick={() => { setShowImport(true); setIsSidebarOpen(false); }}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group"
              >
                <FileText size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase tracking-widest font-black">MT5 Sync</span>
              </button>
            </div>
            <button 
              onClick={() => { setShowAddForm(true); setIsSidebarOpen(false); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <PlusCircle size={18} />
              <span className="text-[10px] uppercase tracking-widest font-black">Add Manual Trade</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#222]">
             <button 
               onClick={exportData}
               className="text-[10px] text-gray-600 hover:text-indigo-400 font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
               title="Backup Data"
             >
               <Download size={12} /> Backup
             </button>
             <label 
               className="text-[10px] text-gray-600 hover:text-amber-500 font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-colors"
               title="Restore Data"
             >
               <Database size={12} /> Restore
               <input type="file" className="hidden" accept=".json" onChange={importData} />
             </label>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 pb-24">
          {activeTab === 'dashboard' && (
            <Dashboard 
              metrics={metrics} 
              trades={filteredTrades} 
              allTrades={trades} 
              accounts={accounts} 
            />
          )}
          {activeTab === 'journal' && (
            <div className="space-y-12">
              <AIInsights trades={filteredTrades} />
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                  <h3 className="text-xl font-black uppercase tracking-tight">Account History & Cycle</h3>
                </div>
                <TradeCalendar trades={filteredTrades} />
                <TradeTable trades={filteredTrades} onDelete={deleteTrade} accounts={accounts} />
              </div>
            </div>
          )}
          {activeTab === 'direction' && <DirectionAssistant />}
          {activeTab === 'analytics' && <Analytics trades={filteredTrades} />}
        </div>
      </main>

      {/* Modals */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#222222] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-[#222222] flex justify-between items-center bg-[#151515]">
              <h2 className="text-xl font-bold tracking-tight text-white">Log New Trade</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <TradeForm onSubmit={addTrades} onCancel={() => setShowAddForm(false)} accounts={accounts} />
            </div>
          </div>
        </div>
      )}

      {showImport && <ImportModal onImport={handleBulkImport} onClose={() => setShowImport(false)} accounts={accounts} />}
      {showImageImport && <ImageImportModal onImport={addTrades} onClose={() => setShowImageImport(false)} accounts={accounts} />}
      
      {showAddAccount && (
        <AddAccountModal onAdd={addAccount} onClose={() => setShowAddAccount(false)} />
      )}
    </div>
  );
};

const FilterButton: React.FC<{ 
  active: boolean, 
  onClick: () => void, 
  onDelete?: () => void, 
  label: string 
}> = ({ active, onClick, onDelete, label }) => (
  <div 
    className={`group relative flex items-center rounded-xl border transition-all mb-1 overflow-hidden ${
      active ? 'bg-indigo-600/10 border-indigo-600/30' : 'border-transparent hover:bg-white/5'
    }`}
  >
    <button 
      onClick={onClick}
      className={`flex-1 text-left px-3 py-2.5 text-[11px] transition-all flex justify-between items-center ${
        active ? 'text-indigo-400 font-bold' : 'text-gray-500'
      }`}
    >
      <span className="truncate tracking-wide">{label}</span>
      {active && <Target size={10} className="shrink-0 text-indigo-400" />}
    </button>
    
    {onDelete && (
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-gray-600 hover:text-rose-500 transition-all border-l border-transparent group-hover:border-[#222]"
        title="Delete Account"
      >
        <Trash2 size={12} />
      </button>
    )}
  </div>
);

const AddAccountModal: React.FC<{ onAdd: (name: string, type: Account['type']) => void, onClose: () => void }> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('Challenge');

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#222] rounded-3xl w-full max-w-md shadow-2xl p-8 animate-in fade-in zoom-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold tracking-tight text-white">New Account</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Account Name</label>
            <input 
              type="text" 
              placeholder="e.g. My Challenge #1"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              className="bg-[#1a1a1a] border border-[#333] rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-700 font-medium text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Personal', 'Capital', 'Challenge'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${
                    type === t ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-black border-[#222] text-gray-500 hover:border-[#444]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={!name.trim()}
            onClick={() => onAdd(name, type)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all border ${active ? 'bg-white/5 text-white border-white/10 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'}`}>
    <div className={active ? 'text-indigo-400' : ''}>{icon}</div>
    <span className="font-semibold tracking-tight text-sm">{label}</span>
  </button>
);

export default App;
