
import { Sparkles, RefreshCw, AlertCircle, Info, BrainCircuit, Volume2, Loader2, Pause, Play } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { analyzeTrades, generateSpeech } from '../services/geminiService';
import { Trade, Account } from '../types';

interface AIInsightsProps {
  trades: Trade[];
  accounts: Account[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ trades, accounts }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [targetAccount, setTargetAccount] = useState<string>('ALL');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const filteredTradesForAI = trades.filter(t => targetAccount === 'ALL' || t.accountType === targetAccount);

  const fetchAnalysis = async () => {
    if (filteredTradesForAI.length < 3) return;
    setLoading(true);
    // Clear previous audio if any
    stopAudio();
    const result = await analyzeTrades(filteredTradesForAI);
    setAnalysis(result);
    setLoading(false);
  };

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const speakAnalysis = async () => {
    if (isSpeaking) {
      stopAudio();
      return;
    }

    if (!analysis) return;

    setAudioLoading(true);
    const audioData = await generateSpeech(analysis);
    
    if (audioData) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const bytes = decodeBase64(audioData);
        const buffer = await decodeAudioData(bytes, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          setIsSpeaking(false);
          audioSourceRef.current = null;
        };
        
        audioSourceRef.current = source;
        source.start();
        setIsSpeaking(true);
      } catch (err) {
        console.error("Playback error:", err);
      }
    }
    setAudioLoading(false);
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div className="bg-[#111111] border border-[#222222] p-8 rounded-[2.5rem] relative overflow-hidden min-h-[350px] flex flex-col">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Sparkles size={160} className="text-indigo-500" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={18} />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">AI Performance Reflection</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-black/40 border border-[#222] p-1 rounded-xl">
              <button 
                onClick={() => setTargetAccount('ALL')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${targetAccount === 'ALL' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                All
              </button>
              {accounts.map(acc => (
                <button 
                  key={acc.id}
                  onClick={() => setTargetAccount(acc.name)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${targetAccount === acc.name ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {acc.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {analysis && (
              <button 
                onClick={fetchAnalysis}
                disabled={loading || filteredTradesForAI.length < 3}
                className="p-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl transition-all disabled:opacity-30"
                title="Refresh Analysis"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>
        
        {/* Content States */}
        <div className="flex-1 flex flex-col relative z-10">
          {filteredTradesForAI.length < 3 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
              <div className="p-4 bg-amber-500/10 rounded-full border border-amber-500/20">
                <Info className="text-amber-500" size={24} />
              </div>
              <p className="text-sm text-gray-500 font-medium max-w-[240px]">
                Targeting <strong>{targetAccount === 'ALL' ? 'All Accounts' : targetAccount}</strong>. 
                Add at least 3 trades to this selection for AI deconstruction.
              </p>
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-600 animate-pulse">Running Session Diagnostics...</p>
            </div>
          ) : !analysis ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center gap-6">
              <div className="w-20 h-20 bg-[#151515] rounded-full flex items-center justify-center border border-[#222]">
                <BrainCircuit className="text-gray-600" size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white tracking-tight">Ready for {targetAccount === 'ALL' ? 'Global' : targetAccount} Inspection</h4>
                <p className="text-xs text-gray-500 max-w-[320px] leading-relaxed mx-auto">
                  Analyze {filteredTradesForAI.length} trades for patterns and leaks.
                </p>
              </div>
              <button 
                onClick={fetchAnalysis}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-3"
              >
                <Sparkles size={16} />
                Generate Deep-Dive
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in duration-700">
              <div className="prose prose-invert max-w-none flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-4">
                {analysis.includes("Quota Exceeded") ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="text-rose-500 shrink-0" size={18} />
                    <p className="text-xs font-bold text-rose-400 leading-relaxed">
                      {analysis}
                    </p>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-gray-300 text-sm font-medium">
                    {analysis.split('\n').map((line, i) => {
                      const trimmed = line.trim();
                      if (trimmed.endsWith(':')) {
                        return <p key={i} className="text-white font-black uppercase text-[11px] tracking-widest mt-6 mb-2">{trimmed}</p>;
                      }
                      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                        return (
                          <div key={i} className="flex gap-3 mb-2">
                            <div className="w-1 h-1 rounded-full bg-indigo-500 shrink-0 mt-2" />
                            <p className="text-gray-300">{trimmed.substring(1).trim()}</p>
                          </div>
                        );
                      }
                      return trimmed ? <p key={i} className="mb-3">{trimmed}</p> : null;
                    })}
                  </div>
                )}
              </div>
              
              {/* Speaker Button */}
              {!analysis.includes("Quota Exceeded") && (
                <div className="mt-8 pt-6 border-t border-[#222] flex justify-end">
                  <button 
                    onClick={speakAnalysis}
                    disabled={audioLoading}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      isSpeaking 
                      ? 'bg-rose-600/10 border border-rose-500/30 text-rose-500' 
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {audioLoading ? (
                      <Loader2 size={16} className="animate-spin text-indigo-400" />
                    ) : isSpeaking ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Volume2 size={16} />
                    )}
                    {audioLoading ? 'Processing Audio...' : isSpeaking ? 'Stop Speaker' : 'Listen to Analysis'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
