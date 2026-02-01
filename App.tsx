
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MarketType, TradeSide, Trade, TradeMetrics, Account, DailyDirection, PerformanceReflection } from './types';
import { Language, translations } from './translations';
import TradeTable from './components/TradeTable';
import TradeForm from './components/TradeForm';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import AIInsights from './components/AIInsights';
import ImportModal from './components/ImportModal';
import ImageImportModal from './components/ImageImportModal';
import TradeCalendar from './components/TradeCalendar';
import DirectionAssistant from './components/DirectionAssistant';
import LoginScreen from './components/LoginScreen';
import { 
  LayoutDashboard, 
  BarChart3, 
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
  NotebookPen,
  FileText,
  Activity,
  Shield,
  User,
  CreditCard,
  Calendar,
  RotateCcw,
  Search,
  LogOut,
  CloudSun,
  CheckCircle2,
  Languages
} from 'lucide-react';

interface UserProfile {
  username: string;
  lastLogin: string;
}

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'personal-1', name: 'Personal Capital', type: 'Personal' },
  { id: 'capital-1', name: 'Just Capital', type: 'Capital' }
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [directionHistory, setDirectionHistory] = useState<DailyDirection[]>([]);
  const [reflections, setReflections] = useState<PerformanceReflection[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'analytics' | 'direction'>('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showImageImport, setShowImageImport] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('trade_track_pro_lang');
    return (saved as Language) || 'en';
  });

  const t = translations[lang];
  const isInitialLoadDone = useRef(false);

  // Filter States
  const [accountFilter, setAccountFilter] = useState<string | 'ALL'>('ALL');
  const [marketFilter, setMarketFilter] = useState<MarketType | 'ALL'>('ALL');
  const [sideFilter, setSideFilter] = useState<TradeSide | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('trade_track_pro_lang', lang);
  }, [lang]);

  useEffect(() => {
    const savedUser = localStorage.getItem('trade_track_pro_active_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setTrades([]);
      setAccounts(DEFAULT_ACCOUNTS);
      setDirectionHistory([]);
      setReflections([]);
      isInitialLoadDone.current = false;
      return;
    }

    const prefix = `trade_track_pro_${user.username}`;
    const savedTrades = localStorage.getItem(`${prefix}_trades`);
    const savedAccounts = localStorage.getItem(`${prefix}_accounts`);
    const savedHistory = localStorage.getItem(`${prefix}_directions`);
    const savedReflections = localStorage.getItem(`${prefix}_reflections`);
    
    const loadedTrades = savedTrades ? JSON.parse(savedTrades) : [];
    const loadedAccounts = savedAccounts ? JSON.parse(savedAccounts) : DEFAULT_ACCOUNTS;
    const loadedHistory = savedHistory ? JSON.parse(savedHistory) : [];
    const loadedReflections = savedReflections ? JSON.parse(savedReflections) : [];

    setTrades(loadedTrades);
    setAccounts(loadedAccounts.length > 0 ? loadedAccounts : DEFAULT_ACCOUNTS);
    setDirectionHistory(loadedHistory);
    setReflections(loadedReflections);
    
    isInitialLoadDone.current = true;
    localStorage.setItem('trade_track_pro_active_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (!user || !isInitialLoadDone.current) return;
    const prefix = `trade_track_pro_${user.username}`;
    localStorage.setItem(`${prefix}_trades`, JSON.stringify(trades));
    localStorage.setItem(`${prefix}_accounts`, JSON.stringify(accounts));
    localStorage.setItem(`${prefix}_directions`, JSON.stringify(directionHistory));
    localStorage.setItem(`${prefix}_reflections`, JSON.stringify(reflections));
  }, [trades, accounts, directionHistory, reflections, user]);

  const handleLogin = (newUser: UserProfile) => {
    isInitialLoadDone.current = false;
    setUser(newUser);
  };

  const handleLogout = () => {
    if (window.confirm(t.secure_logout)) {
      localStorage.removeItem('trade_track_pro_active_user');
      setUser(null);
      setIsSidebarOpen(false);
      isInitialLoadDone.current = false;
    }
  };

  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      const matchAccount = accountFilter === 'ALL' || t.accountType === accountFilter;
      const matchMarket = marketFilter === 'ALL' || t.marketType === marketFilter;
      const matchSide = sideFilter === 'ALL' || t.side === sideFilter;
      const matchStart = !startDate || t.date >= startDate;
      const matchEnd = !endDate || t.date <= endDate;
      return matchAccount && matchMarket && matchSide && matchStart && matchEnd;
    });
  }, [trades, accountFilter, marketFilter, sideFilter, startDate, endDate]);

  const metrics = useMemo(() => {
    const totalTrades = filteredTrades.length;
    if (totalTrades === 0) {
      return {
        totalPnl: 0, winRate: 0, profitFactor: 0, totalTrades: 0,
        winningTrades: 0, losingTrades: 0, avgWin: 0, avgLoss: 0, maxDrawdown: 0
      };
    }
    const winningTrades = filteredTrades.filter(t => t.pnl > 0);
    const losingTrades = filteredTrades.filter(t => t.pnl < 0);
    const totalPnl = filteredTrades.reduce((acc, t) => acc + t.pnl, 0);
    const totalWinPnl = winningTrades.reduce((acc, t) => acc + t.pnl, 0);
    const totalLossPnl = Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0));
    let maxEquity = 0; let currentEquity = 0; let maxDD = 0;
    [...filteredTrades].reverse().forEach(t => {
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
  }, [filteredTrades]);

  const addTrades = (newTrades: Trade | Trade[]) => {
    const tradeArray = Array.isArray(newTrades) ? newTrades : [newTrades];
    setTrades(prev => [...tradeArray, ...prev]);
    setShowAddForm(false);
    setShowImageImport(false);
    setShowImport(false);
    setActiveTab('journal');
  };

  const addAccount = (name: string, type: Account['type']) => {
    const newAcc: Account = { id: crypto.randomUUID(), name, type };
    setAccounts(prev => [...prev, newAcc]);
    setShowAddAccount(false);
  };

  const deleteAccount = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      if (accountFilter === name) setAccountFilter('ALL');
    }
  };

  const clearFilters = () => {
    setMarketFilter('ALL');
    setSideFilter('ALL');
    setStartDate('');
    setEndDate('');
    setAccountFilter('ALL');
  };

  const handleUpdateDirectionRecord = (updatedRecord: DailyDirection) => {
    setDirectionHistory(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };

  const handleSaveReflection = (content: string, account: string) => {
    const newReflection: PerformanceReflection = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      content,
      account
    };
    setReflections(prev => [newReflection, ...prev]);
  };

  const handleDeleteReflection = (id: string) => {
    setReflections(prev => prev.filter(r => r.id !== id));
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'es' : 'en');
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} currentLang={lang} onLangToggle={toggleLang} />;
  }

  return (
    <div className="min-h-screen theme-bg-app theme-text-p flex flex-col md:flex-row font-sans">
      <header className="md:hidden flex items-center justify-between p-4 theme-bg-sidebar border-b theme-border sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <TrendingUp className="theme-accent w-6 h-6" />
          <h1 className="text-sm font-black tracking-tight">TradeTrack<span className="theme-accent">Pro</span></h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 theme-text-s hover:theme-text-p transition-colors">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <aside className={`fixed inset-0 z-[55] md:relative md:flex w-full md:w-72 theme-bg-sidebar border-r theme-border p-6 flex flex-col gap-8 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col gap-1 select-none">
          <div className="flex items-center gap-3">
            <div className="p-2 theme-bg-accent rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight">TradeTrack<span className="theme-accent">Pro</span></h1>
          </div>
          <p className="text-[9px] font-black tracking-[0.4em] theme-text-s uppercase ml-1 mt-1 opacity-70">DIRECTIONDAY</p>
        </div>

        <div className="theme-bg-app p-4 rounded-2xl border theme-border flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl theme-bg-accent flex items-center justify-center text-white font-black text-sm uppercase">
              {user.username.slice(0, 2)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider theme-text-p truncate max-w-[100px]">{user.username}</span>
              <span className="text-[8px] font-bold theme-text-s uppercase tracking-widest flex items-center gap-1">
                <CloudSun size={10} className="text-emerald-500" /> Active Vault
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 theme-text-s hover:text-rose-500 transition-colors"
            title={t.logout}
          >
            <LogOut size={16} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} icon={<LayoutDashboard size={20} />} label={t.dashboard} />
          <NavItem active={activeTab === 'journal'} onClick={() => { setActiveTab('journal'); setIsSidebarOpen(false); }} icon={<NotebookPen size={20} />} label={t.journal} />
          <NavItem active={activeTab === 'direction'} onClick={() => { setActiveTab('direction'); setIsSidebarOpen(false); }} icon={<Zap size={20} />} label={t.direction} />
          <NavItem active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} icon={<BarChart3 size={20} />} label={t.performance} />
        </nav>

        <div className="mt-auto space-y-4">
          <div className="theme-bg-app p-4 rounded-xl border theme-border">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] theme-text-s uppercase font-black flex items-center gap-2 tracking-wider">
                <Filter size={12} /> {t.accounts}
              </label>
              <button onClick={() => setShowAddAccount(true)} className="p-1 hover:bg-white/10 rounded-md theme-accent transition-colors" title="Add">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
              <FilterButton active={accountFilter === 'ALL'} onClick={() => { setAccountFilter('ALL'); setIsSidebarOpen(false); }} label={t.all_accounts} />
              {accounts.map(acc => (
                <FilterButton key={acc.id} active={accountFilter === acc.name} onClick={() => { setAccountFilter(acc.name); setIsSidebarOpen(false); }} onDelete={() => deleteAccount(acc.id, acc.name)} label={acc.name} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-black theme-text-s uppercase tracking-widest ml-1 mb-1">{t.smart_tools}</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setShowImageImport(true); setIsSidebarOpen(false); }} className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group">
                <Camera size={20} />
                <span className="text-[10px] uppercase tracking-widest font-black">{t.analyze}</span>
              </button>
              <button onClick={() => { setShowImport(true); setIsSidebarOpen(false); }} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group">
                <FileText size={20} />
                <span className="text-[10px] uppercase tracking-widest font-black">{t.mt5_sync}</span>
              </button>
            </div>
            <button onClick={() => { setShowAddForm(true); setIsSidebarOpen(false); }} className="w-full theme-bg-accent hover:theme-bg-accent text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all">
              <PlusCircle size={18} />
              <span className="text-[10px] uppercase tracking-widest font-black">{t.manual_trade}</span>
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-3 border-t theme-border">
             <div className="flex items-center justify-between">
               <button onClick={toggleLang} className="text-[10px] theme-text-s hover:theme-accent font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                 <Languages size={12} /> {lang === 'en' ? 'ES' : 'EN'}
               </button>
               <div className="flex items-center gap-2 px-1">
                 <CheckCircle2 size={10} className="text-emerald-500" />
                 <span className="text-[8px] font-black uppercase tracking-widest theme-text-s">{t.persistence_active}</span>
               </div>
             </div>
             <div className="flex items-center justify-between">
               <button onClick={() => {}} className="text-[10px] theme-text-s hover:theme-accent font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                 <Download size={12} /> {t.backup}
               </button>
               <label className="text-[10px] theme-text-s hover:text-amber-500 font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-colors">
                 <Database size={12} /> {t.restore}
                 <input type="file" className="hidden" accept=".json" />
               </label>
             </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto theme-bg-app">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 pb-24">
          {activeTab === 'dashboard' && <Dashboard metrics={metrics} trades={filteredTrades} allTrades={trades} accounts={accounts} lang={lang} />}
          
          {activeTab === 'journal' && (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b theme-border pb-8">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">{t.journal}</h2>
                  <p className="theme-text-s text-sm">Operation "The Sheet" — Full Execution Logs</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] theme-text-s font-black uppercase tracking-widest">{t.active_pnl}</p>
                    <p className={`text-xl font-black font-mono ${metrics.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${metrics.totalPnl.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                  </div>
                </div>
              </div>

              <div className="theme-bg-sidebar border theme-border p-4 rounded-[1.5rem] shadow-xl space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px] flex items-center gap-2 theme-bg-app border theme-border px-3 py-2 rounded-xl">
                    <Search size={14} className="theme-text-s" />
                    <span className="text-[10px] font-black uppercase theme-text-s tracking-widest">{t.filter_controls}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black theme-text-s uppercase tracking-widest ml-1">{t.market}</label>
                      <div className="flex theme-bg-app border theme-border p-1 rounded-xl">
                        {(['ALL', MarketType.FOREX, MarketType.FUTURES] as const).map(m => (
                          <button key={m} onClick={() => setMarketFilter(m)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${marketFilter === m ? 'theme-bg-accent text-white shadow-lg' : 'theme-text-s hover:theme-text-p'}`}>{m}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black theme-text-s uppercase tracking-widest ml-1">{t.side}</label>
                      <div className="flex theme-bg-app border theme-border p-1 rounded-xl">
                        {(['ALL', TradeSide.LONG, TradeSide.SHORT] as const).map(s => (
                          <button key={s} onClick={() => setSideFilter(s)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sideFilter === s ? 'theme-bg-accent text-white shadow-lg' : 'theme-text-s hover:theme-text-p'}`}>{lang === 'es' ? (s === 'Long' ? 'Largo' : s === 'Short' ? 'Corto' : s) : s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black theme-text-s uppercase tracking-widest ml-1">{t.date_range}</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="theme-bg-app border theme-border px-3 py-1.5 rounded-xl bg-transparent text-[10px] font-mono font-bold outline-none theme-text-p uppercase" />
                        <span className="theme-text-s text-[10px] font-black">{t.to}</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="theme-bg-app border theme-border px-3 py-1.5 rounded-xl bg-transparent text-[10px] font-mono font-bold outline-none theme-text-p uppercase" />
                      </div>
                    </div>
                    <button onClick={clearFilters} className="mt-auto mb-1 p-2 bg-white/5 hover:bg-rose-500/10 border theme-border rounded-xl theme-text-s hover:text-rose-500 transition-all"><RotateCcw size={14} /></button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t theme-border opacity-70">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black theme-accent uppercase tracking-[0.2em] px-3 py-1 theme-bg-sidebar border theme-border rounded-full">
                      {filteredTrades.length} {t.results_found}
                    </span>
                    {(marketFilter !== 'ALL' || sideFilter !== 'ALL' || startDate || endDate) && (
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Activity size={10} /> {t.filters_active}
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] font-black theme-text-s uppercase tracking-widest font-mono">
                    {t.total_volume}: {filteredTrades.reduce((sum, tr) => sum + tr.size, 0).toFixed(2)} Lots
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <AIInsights 
                    trades={trades} 
                    accounts={accounts} 
                    reflections={reflections} 
                    onSaveReflection={handleSaveReflection}
                    onDeleteReflection={handleDeleteReflection}
                    lang={lang}
                  />
                </div>
                <div className="theme-bg-sidebar border theme-border p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Activity className="theme-accent" size={18} />
                    <h3 className="text-sm font-black uppercase tracking-widest">{t.summary}</h3>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[300px]">
                    {accounts.map(acc => {
                      const accPnl = trades.filter(tr => tr.accountType === acc.name).reduce((sum, tr) => sum + tr.pnl, 0);
                      return (
                        <div key={acc.id} className="p-4 theme-bg-app border theme-border rounded-2xl flex justify-between items-center group hover:theme-accent transition-all">
                          <div className="flex items-center gap-3 truncate">
                            {acc.type === 'Personal' ? <User size={14} className="theme-accent" /> : <Shield size={14} className="text-amber-400" />}
                            <span className="text-xs font-bold theme-text-p truncate">{acc.name}</span>
                          </div>
                          <span className={`text-xs font-black font-mono ${accPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ${accPnl.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 theme-bg-accent rounded-full" />
                  <h3 className="text-xl font-black uppercase tracking-tight">{t.the_sheet}</h3>
                </div>
                <TradeCalendar trades={filteredTrades} />
                <div className="theme-bg-sidebar border theme-border rounded-[2.5rem] p-1 overflow-hidden shadow-2xl">
                  <TradeTable trades={filteredTrades} onDelete={(id) => setTrades(prev => prev.filter(tr => tr.id !== id))} accounts={accounts} />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'direction' && (
            <DirectionAssistant 
              onSaveRecord={(rec) => setDirectionHistory(prev => [rec, ...prev])} 
              history={directionHistory} 
              onDeleteRecord={(id) => setDirectionHistory(prev => prev.filter(r => r.id !== id))}
              onUpdateRecord={handleUpdateDirectionRecord}
              lang={lang}
            />
          )}
          {activeTab === 'analytics' && <Analytics trades={filteredTrades} />}
        </div>
      </main>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="theme-bg-sidebar border theme-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b theme-border flex justify-between items-center theme-bg-app">
              <h2 className="text-xl font-bold tracking-tight theme-text-p">{t.log_new_trade}</h2>
              <button onClick={() => setShowAddForm(false)} className="theme-text-s hover:theme-text-p transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <TradeForm onSubmit={addTrades} onCancel={() => setShowAddForm(false)} accounts={accounts} lang={lang} />
            </div>
          </div>
        </div>
      )}
      {showImport && <ImportModal onImport={addTrades} onClose={() => setShowImport(false)} accounts={accounts} />}
      {showImageImport && <ImageImportModal onImport={addTrades} onClose={() => setShowImageImport(false)} accounts={accounts} existingTrades={trades} />}
      {showAddAccount && <AddAccountModal onAdd={addAccount} onClose={() => setShowAddAccount(false)} />}
    </div>
  );
};

const FilterButton: React.FC<{ active: boolean, onClick: () => void, onDelete?: () => void, label: string }> = ({ active, onClick, onDelete, label }) => (
  <div className={`group relative flex items-center rounded-xl border transition-all mb-1 overflow-hidden ${active ? 'theme-bg-accent bg-opacity-10 border-indigo-600/30' : 'border-transparent hover:theme-bg-app'}`}>
    <button onClick={onClick} className={`flex-1 text-left px-3 py-2.5 text-[11px] transition-all flex justify-between items-center ${active ? 'theme-accent font-bold' : 'theme-text-s'}`}>
      <span className="truncate tracking-wide">{label}</span>
      {active && <Target size={10} className="shrink-0 theme-accent" />}
    </button>
    {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 theme-text-s hover:text-rose-500 transition-all border-l border-transparent group-hover:theme-border"><Trash2 size={12} /></button>}
  </div>
);

const AddAccountModal: React.FC<{ onAdd: (name: string, type: Account['type']) => void, onClose: () => void }> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('Challenge');
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="theme-bg-sidebar border theme-border rounded-3xl w-full max-w-md shadow-2xl p-8 animate-in fade-in zoom-in">
        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold tracking-tight theme-text-p">New Account</h3><button onClick={onClose} className="theme-text-s hover:theme-text-p transition-colors"><X size={20} /></button></div>
        <div className="space-y-6">
          <div className="flex flex-col gap-2"><label className="text-[10px] theme-text-s uppercase font-black tracking-widest">Account Name</label><input type="text" placeholder="e.g. My Challenge #1" value={name} autoFocus onChange={(e) => setName(e.target.value)} className="theme-bg-app border theme-border rounded-xl p-3 focus:ring-2 focus:theme-accent outline-none font-medium theme-text-p" /></div>
          <div className="flex flex-col gap-2"><label className="text-[10px] theme-text-s uppercase font-black tracking-widest">Account Type</label><div className="grid grid-cols-3 gap-2">{(['Personal', 'Capital', 'Challenge'] as const).map(t => (<button key={t} type="button" onClick={() => setType(t)} className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${type === t ? 'theme-bg-accent border-transparent text-white shadow-lg' : 'theme-bg-app theme-border theme-text-s'}`}>{t}</button>))}</div></div>
          <button disabled={!name.trim()} onClick={() => onAdd(name, type)} className="w-full py-4 theme-bg-accent hover:theme-bg-accent text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all">Create Account</button>
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all border ${active ? 'bg-white/5 theme-text-p theme-border shadow-sm' : 'theme-text-s hover:theme-text-p hover:bg-white/5 border-transparent'}`}>
    <div className={active ? 'theme-accent' : ''}>{icon}</div>
    <span className="font-semibold tracking-tight text-sm">{label}</span>
  </button>
);

export default App;
