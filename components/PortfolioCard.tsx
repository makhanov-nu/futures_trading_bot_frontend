"use client";

import type { Portfolio } from "@/types/trading";

interface Props {
  portfolio: Portfolio;
}

function fmt(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtUsd(value: number | null | undefined): string {
  if (value == null) return "—";
  return (
    "$" +
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function pctClass(value: number | null | undefined): string {
  if (value == null) return "text-gray-400";
  if (value > 0) return "text-green-400";
  if (value < 0) return "text-red-400";
  return "text-gray-400";
}

interface MetricRowProps {
  label: string;
  value: string;
  valueClass?: string;
}

function MetricRow({ label, value, valueClass = "text-gray-100" }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-medium tabular-nums ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

export default function PortfolioCard({ portfolio }: Props) {
  const {
    equity,
    cash,
    pnl_pct,
    daily_pnl_pct,
    drawdown_pct,
    sharpe_ratio,
    win_rate,
    total_trades,
  } = portfolio;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 h-full">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
        Portfolio
      </h2>

      {/* Equity — hero number */}
      <div className="mb-4">
        <p className="text-3xl font-bold tabular-nums text-gray-100">
          {fmtUsd(equity)}
        </p>
        <p className={`text-sm mt-1 tabular-nums ${pctClass(pnl_pct)}`}>
          {pnl_pct != null ? (pnl_pct >= 0 ? "+" : "") + fmt(pnl_pct) : "—"}% all-time
        </p>
      </div>

      <div>
        <MetricRow label="Cash" value={fmtUsd(cash)} />
        <MetricRow
          label="Daily P&L"
          value={
            daily_pnl_pct != null
              ? (daily_pnl_pct >= 0 ? "+" : "") + fmt(daily_pnl_pct) + "%"
              : "—"
          }
          valueClass={pctClass(daily_pnl_pct)}
        />
        <MetricRow
          label="Max Drawdown"
          value={drawdown_pct != null ? fmt(drawdown_pct) + "%" : "—"}
          valueClass={
            drawdown_pct != null && drawdown_pct < 0
              ? "text-red-400"
              : "text-gray-100"
          }
        />
        <MetricRow
          label="Sharpe Ratio"
          value={fmt(sharpe_ratio)}
          valueClass={
            sharpe_ratio != null && sharpe_ratio >= 1
              ? "text-green-400"
              : sharpe_ratio != null && sharpe_ratio < 0
              ? "text-red-400"
              : "text-gray-100"
          }
        />
        <MetricRow
          label="Win Rate"
          value={win_rate != null ? fmt(win_rate * 100) + "%" : "—"}
          valueClass={
            win_rate != null && win_rate >= 0.5
              ? "text-green-400"
              : "text-red-400"
          }
        />
        <MetricRow
          label="Total Trades"
          value={total_trades != null ? String(total_trades) : "—"}
        />
      </div>
    </div>
  );
}
