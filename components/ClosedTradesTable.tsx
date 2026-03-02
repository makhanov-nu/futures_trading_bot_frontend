"use client";

import { useState } from "react";
import type { ClosedTrade } from "@/types/trading";

interface Props {
  trades: ClosedTrade[];
}

function fmtUsd(value: number | null | undefined): string {
  if (value == null) return "—";
  return (
    "$" +
    Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmt(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SortKey = "closed_at" | "pnl" | "pnl_pct";
type SortDir = "asc" | "desc";

export default function ClosedTradesTable({ trades }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("closed_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...(trades ?? [])].sort((a, b) => {
    let aVal: number;
    let bVal: number;

    if (sortKey === "closed_at") {
      aVal = new Date(a.closed_at ?? 0).getTime();
      bVal = new Date(b.closed_at ?? 0).getTime();
    } else {
      aVal = a[sortKey] ?? 0;
      bVal = b[sortKey] ?? 0;
    }

    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (col !== sortKey) {
      return <span className="text-gray-700 ml-1">↕</span>;
    }
    return (
      <span className="text-gray-400 ml-1">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
        Closed Trades ({trades?.length ?? 0})
      </h2>

      {!trades || trades.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm py-6">
          No closed trades yet
        </div>
      ) : (
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-gray-900">
              <tr className="border-b border-gray-800">
                <th className="pb-2 pr-3 font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Symbol
                </th>
                <th className="pb-2 pr-3 font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Side
                </th>
                <th className="pb-2 pr-3 font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Entry → Exit
                </th>
                <th
                  className="pb-2 pr-3 font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-gray-300 select-none"
                  onClick={() => handleSort("pnl")}
                >
                  P&L <SortIcon col="pnl" />
                </th>
                <th
                  className="pb-2 pr-3 font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-gray-300 select-none"
                  onClick={() => handleSort("pnl_pct")}
                >
                  P&L % <SortIcon col="pnl_pct" />
                </th>
                <th className="pb-2 pr-3 font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Reason
                </th>
                <th
                  className="pb-2 font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-gray-300 select-none"
                  onClick={() => handleSort("closed_at")}
                >
                  Closed <SortIcon col="closed_at" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((trade, idx) => {
                const pnlPositive = trade.pnl != null && trade.pnl >= 0;
                return (
                  <tr
                    key={`${trade.symbol}-${trade.closed_at}-${idx}`}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="py-2 pr-3 font-medium text-gray-100 whitespace-nowrap">
                      {trade.symbol}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          trade.side === "LONG"
                            ? "bg-green-900/50 text-green-400"
                            : "bg-red-900/50 text-red-400"
                        }`}
                      >
                        {trade.side}
                      </span>
                    </td>
                    <td className="py-2 pr-3 tabular-nums text-gray-400 whitespace-nowrap">
                      {trade.entry != null
                        ? "$" +
                          trade.entry.toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                      <span className="text-gray-600 mx-1">→</span>
                      {trade.exit != null
                        ? "$" +
                          trade.exit.toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </td>
                    <td
                      className={`py-2 pr-3 tabular-nums font-medium whitespace-nowrap ${
                        pnlPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {trade.pnl != null
                        ? (pnlPositive ? "+" : "-") + fmtUsd(trade.pnl)
                        : "—"}
                    </td>
                    <td
                      className={`py-2 pr-3 tabular-nums font-medium whitespace-nowrap ${
                        pnlPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {trade.pnl_pct != null
                        ? (trade.pnl_pct >= 0 ? "+" : "") +
                          fmt(trade.pnl_pct) +
                          "%"
                        : "—"}
                    </td>
                    <td className="py-2 pr-3 text-gray-500 max-w-[120px] truncate">
                      {trade.reason ?? "—"}
                    </td>
                    <td className="py-2 tabular-nums text-gray-500 whitespace-nowrap">
                      {fmtDate(trade.closed_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
