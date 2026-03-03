export interface Position {
  symbol: string;
  side: "LONG" | "SHORT";
  entry_price: number;
  notional: number;
  margin: number;
  size_pct: number;
  leverage: number;
  unrealised_pnl: number;
  unrealised_pnl_pct: number;
  liquidation_price: number;
  stop_loss_price: number;
  take_profit_price: number | null;
  opened_at: string;
  reason: string;
}

export interface ClosedTrade {
  symbol: string;
  side: "LONG" | "SHORT";
  action: string;
  entry: number;
  exit: number;
  pnl: number;
  pnl_pct: number;
  size_usd: number;
  notional: number;
  leverage: number;
  reason: string;
  opened_at: string;
  closed_at: string;
}

export interface Portfolio {
  equity: number;
  cash: number;
  pnl_pct: number;
  daily_pnl_pct: number;
  drawdown_pct: number;
  sharpe_ratio: number;
  win_rate: number;
  total_trades: number;
  open_positions: Position[];
  closed_trades: ClosedTrade[];
}

export interface TradeEvent {
  type: "trade_event";
  event: string;
  symbol: string;
  side: string;
  price: number;
  pnl?: number;
  pnl_pct?: number;
  reason: string;
  timestamp: string;
}

export interface SnapshotMessage {
  type: "snapshot";
  timestamp: string;
  portfolio: Portfolio;
}

export interface PriceData {
  symbol: string;
  bid: number;
  ask: number;
  mark: number;
  spread: number;
  timestamp: string;
}

export interface PriceUpdateMessage {
  type: "price_update";
  timestamp: string;
  prices: Record<string, PriceData>;
}

export interface NewsEvent {
  type: "news_event";
  id: number;
  urgency: "URGENT" | "IMPORTANT" | "ROUTINE" | "NOISE";
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  summary: string;
  source: string;
  content: string;
  affected_assets: string[];
  timestamp: string;
}
