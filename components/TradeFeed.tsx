"use client";

import type { TradeEvent } from "@/types/trading";

interface Props {
  events: TradeEvent[];
}

type EventKey = "open" | "close" | "stop_loss" | "take_profit" | "liquidation";

const EVENT_STYLES: Record<
  EventKey,
  { label: string; badge: string }
> = {
  open: { label: "OPEN", badge: "bg-green-900/60 text-green-400" },
  close: { label: "CLOSE", badge: "bg-blue-900/60 text-blue-400" },
  stop_loss: { label: "STOP LOSS", badge: "bg-red-900/60 text-red-400" },
  take_profit: { label: "TP", badge: "bg-green-900/60 text-green-400" },
  liquidation: { label: "LIQUIDATION", badge: "bg-red-950 text-red-300" },
};

function getEventStyle(event: string): { label: string; badge: string } {
  return (
    EVENT_STYLES[event.toLowerCase() as EventKey] ?? {
      label: event.toUpperCase(),
      badge: "bg-gray-700 text-gray-300",
    }
  );
}

function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
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

export default function TradeFeed({ events }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
        Trade Feed
      </h2>

      {!events || events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm py-6">
          Waiting for trade events...
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700">
          {events.map((ev, idx) => {
            const style = getEventStyle(ev.event ?? "");
            const hasPnl = ev.pnl != null;
            const pnlPositive = hasPnl && (ev.pnl ?? 0) >= 0;
            return (
              <div
                key={`${ev.timestamp}-${idx}`}
                className="flex items-start gap-2.5 text-xs border-b border-gray-800 pb-2 last:border-0"
              >
                {/* Time */}
                <span className="text-gray-600 tabular-nums shrink-0 mt-0.5 w-16">
                  {fmtTime(ev.timestamp)}
                </span>

                {/* Event badge */}
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${style.badge}`}
                >
                  {style.label}
                </span>

                {/* Symbol + side */}
                <div className="flex-1 min-w-0">
                  <span className="text-gray-200 font-medium">{ev.symbol}</span>
                  {ev.side && (
                    <span
                      className={`ml-1.5 text-[10px] ${
                        ev.side.toUpperCase() === "LONG"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {ev.side.toUpperCase()}
                    </span>
                  )}
                  {ev.price != null && (
                    <span className="text-gray-500 ml-1.5 tabular-nums">
                      @ ${ev.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                {/* PnL */}
                {hasPnl && (
                  <span
                    className={`tabular-nums font-medium shrink-0 ${
                      pnlPositive ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {pnlPositive ? "+" : "-"}
                    {fmtUsd(ev.pnl)}
                    {ev.pnl_pct != null && (
                      <span className="text-[10px] ml-1">
                        ({pnlPositive ? "+" : ""}
                        {ev.pnl_pct.toFixed(2)}%)
                      </span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
