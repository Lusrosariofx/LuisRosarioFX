
export enum MarketType {
  FOREX = 'Forex',
  FUTURES = 'Futures'
}

export enum TradeSide {
  LONG = 'Long',
  SHORT = 'Short'
}

export enum AccountType {
  PERSONAL_CAPITAL = 'Personal Capital',
  JUST_CAPITAL = 'Just Capital'
}

export type AppTheme = 'dark' | 'light' | 'neon';

export interface Account {
  id: string;
  name: string;
  type: 'Personal' | 'Capital' | 'Challenge';
  description?: string;
}

export interface DailyDirection {
  id: string;
  date: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  reasoning: string;
  keyLevels: string[];
  screenshot?: string;
}

export interface Trade {
  id: string;
  date: string;
  instrument: string;
  marketType: MarketType;
  accountType: string;
  side: TradeSide;
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  notes?: string;
  screenshot?: string;
}

export interface TradeMetrics {
  totalPnl: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
}
