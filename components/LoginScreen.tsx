
import React, { useState } from 'react';
import { TrendingUp, Lock, User, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

interface UserProfile {
  username: string;
  lastLogin: string;
}

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    // Simulating authentication delay
    setTimeout(() => {
      onLogin({
        username,
        lastLogin: new Date().toISOString()
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen theme-bg-app flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 theme-bg-accent rounded-3xl shadow-2xl shadow-indigo-600/20 mb-6">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight theme-text-p mb-2">
            TradeTrack<span className="theme-accent">Pro</span>
          </h1>
          <p className="theme-text-s text-sm font-medium uppercase tracking-[0.2em]">Institutional Vault Access</p>
        </div>

        <div className="theme-bg-sidebar border theme-border rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${isLogin ? 'theme-accent border-indigo-500' : 'theme-text-s border-transparent'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${!isLogin ? 'theme-accent border-indigo-500' : 'theme-text-s border-transparent'}`}
            >
              New Vault
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black theme-text-s uppercase tracking-widest ml-1">Terminal Identity</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-s group-focus-within:theme-accent transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full theme-bg-app border theme-border rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:theme-accent theme-text-p font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black theme-text-s uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-s group-focus-within:theme-accent transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full theme-bg-app border theme-border rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:theme-accent theme-text-p font-medium transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading || !username || !password}
              className="w-full py-5 theme-bg-accent hover:theme-bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {isLogin ? 'Initialize Session' : 'Create Secure Vault'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t theme-border flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={14} />
              <span className="text-[10px] font-bold theme-text-s uppercase tracking-widest">End-to-End</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="theme-accent" size={14} />
              <span className="text-[10px] font-bold theme-text-s uppercase tracking-widest">AI Enabled</span>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] font-black theme-text-s uppercase tracking-[0.3em] opacity-50">
          PROPRIETARY TERMINAL VERSION 4.2.0
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
