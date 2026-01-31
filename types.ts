
export enum MarketType {
  FOREX = 'Forex',
  FUTURES = 'Futures'
}

export enum TradeSide {
  LONG = 'Long',
  SHORT = 'Short'
}

/* Added AccountType enum for standardized account identification across services */
export enum AccountType {
  PERSONAL_CAPITAL = 'Personal Capital',
  JUST_CAPITAL = 'Just Capital'
}

export interface Account {
  id: string;
  name: string;
  type: 'Personal' | 'Capital' | 'Challenge';
  description?: string;
}

export interface Trade {
  id: string;
  date: string;
  instrument: string;
  marketType: MarketType;
  accountType: string; // Changed from enum to string for dynamic support
  side: TradeSide;
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  notes?: string;
  screenshot?: string; // Base64 image data
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
