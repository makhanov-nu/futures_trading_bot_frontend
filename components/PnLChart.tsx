"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ClosedTrade } from "@/types/trading";

interface Props {
  closedTrades: ClosedTrade[];
}

interface EquityPoint {
  date: string;
  equity: number;
}

const STARTING_BALANCE = 10_000;

function buildEquityCurve(trades: ClosedTrade[]): EquityPoint[] {
  if (!trades || trades.length === 0) return [];

  const sorted = [...trades].sort(
    (a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime()
  );

  let running = STARTING_BALANCE;
  const points: EquityPoint[] = [
    {
      date: new Date(sorted[0].opened_at ?? sorted[0].closed_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      equity: running,
    },
  ];

  for (const trade of sorted) {
    running += trade.pnl ?? 0;
    points.push({
      date: new Date(trade.closed_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      equity: parseFloat(running.toFixed(2)),
    });
  }

  return points;
}

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0].value;
  const delta = value - STARTING_BALANCE;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-gray-100 font-medium">
        ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p className={delta >= 0 ? "text-green-400" : "text-red-400"}>
        {delta >= 0 ? "+" : ""}
        {delta.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function PnLChart({ closedTrades }: Props) {
  const data = buildEquityCurve(closedTrades);

  const isEmpty = data.length === 0;
  const finalEquity = isEmpty ? STARTING_BALANCE : data[data.length - 1].equity;
  const isProfit = finalEquity >= STARTING_BALANCE;
  const strokeColor = isProfit ? "#4ade80" : "#f87171";
  const gradientId = isProfit ? "equityGreen" : "equityRed";
  const gradientColor = isProfit ? "#4ade80" : "#f87171";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Equity Curve
        </h2>
        {!isEmpty && (
          <span className={`text-sm font-medium tabular-nums ${isProfit ? "text-green-400" : "text-red-400"}`}>
            $
            {finalEquity.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
          No trade history yet
        </div>
      ) : (
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={gradientColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  "$" + (v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toString())
                }
                width={56}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="equity"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
