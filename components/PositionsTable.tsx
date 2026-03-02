"use client";

import type { Position } from "@/types/trading";

interface Props {
  positions: Position[];
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

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PositionsTable({ positions }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
        Open Positions ({positions?.length ?? 0})
      </h2>

      {!positions || positions.length === 0 ? (
        <p className="text-gray-600 text-sm py-6 text-center">
          No open positions
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-800">
                {[
                  "Symbol",
                  "Side",
                  "Entry Price",
                  "Notional",
                  "Margin",
                  "uPnL",
                  "uPnL %",
                  "Liq Price",
                  "SL Price",
                  "Opened At",
                ].map((col) => (
                  <th
                    key={col}
                    className="pb-2 pr-4 font-medium text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, idx) => {
                const pnlPositive =
                  pos.unrealised_pnl != null && pos.unrealised_pnl >= 0;
                return (
                  <tr
                    key={`${pos.symbol}-${idx}`}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="py-2.5 pr-4 font-medium text-gray-100 whitespace-nowrap">
                      {pos.symbol}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          pos.side === "LONG"
                            ? "bg-green-900/50 text-green-400"
                            : "bg-red-900/50 text-red-400"
                        }`}
                      >
                        {pos.side}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-gray-300 whitespace-nowrap">
                      {fmtUsd(pos.entry_price)}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-gray-300 whitespace-nowrap">
                      {fmtUsd(pos.notional)}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-gray-300 whitespace-nowrap">
                      {fmtUsd(pos.margin)}
                    </td>
                    <td
                      className={`py-2.5 pr-4 tabular-nums font-medium whitespace-nowrap ${
                        pnlPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {pos.unrealised_pnl != null
                        ? (pos.unrealised_pnl >= 0 ? "+" : "") +
                          fmtUsd(pos.unrealised_pnl)
                        : "—"}
                    </td>
                    <td
                      className={`py-2.5 pr-4 tabular-nums font-medium whitespace-nowrap ${
                        pnlPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {pos.unrealised_pnl_pct != null
                        ? (pos.unrealised_pnl_pct >= 0 ? "+" : "") +
                          fmt(pos.unrealised_pnl_pct) +
                          "%"
                        : "—"}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-red-300 whitespace-nowrap">
                      {fmtUsd(pos.liquidation_price)}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-yellow-500 whitespace-nowrap">
                      {fmtUsd(pos.stop_loss_price)}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-gray-500 whitespace-nowrap text-xs">
                      {fmtDate(pos.opened_at)}
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
