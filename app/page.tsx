"use client";

import { useWebSocket } from "@/context/WebSocketContext";
import PortfolioCard from "@/components/PortfolioCard";
import PnLChart from "@/components/PnLChart";
import PositionsTable from "@/components/PositionsTable";
import TradeFeed from "@/components/TradeFeed";
import ClosedTradesTable from "@/components/ClosedTradesTable";
import PriceTicker from "@/components/PriceTicker";
import NewsFeed from "@/components/NewsFeed";
import TradingChart from "@/components/TradingChart";

export default function DashboardPage() {
  const { portfolio, events, connected, lastUpdated } = useWebSocket();

  return (
    <div className="min-h-screen bg-gray-950 p-4 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-800 pb-3">
        <h1 className="text-xl font-semibold tracking-tight text-gray-100">
          AQQYL Futures Dashboard
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              connected ? "bg-green-400" : "bg-red-500"
            }`}
          />
          <span className={connected ? "text-green-400" : "text-red-400"}>
            {connected ? "Live" : "Disconnected"}
          </span>
          {lastUpdated && (
            <span className="text-gray-500 ml-2 hidden sm:inline">
              updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </header>

      {portfolio === null ? (
        /* Connecting state */
        <div className="flex flex-col items-center justify-center h-96 gap-3 text-gray-400">
          <svg
            className="animate-spin h-8 w-8 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-lg">Connecting to trading server...</p>
          <p className="text-sm text-gray-600">
            {process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Price Ticker - Full Width */}
          <PriceTicker />

          {/* Trading Chart */}
          <TradingChart />

          {/* Row 1: PortfolioCard + PnLChart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <PortfolioCard portfolio={portfolio} />
            </div>
            <div className="lg:col-span-2">
              <PnLChart closedTrades={portfolio.closed_trades} />
            </div>
          </div>

          {/* Row 2: PositionsTable (full width) */}
          <PositionsTable positions={portfolio.open_positions} />

          {/* Row 3: NewsFeed + TradeFeed + ClosedTradesTable */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <NewsFeed />
            </div>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-4">
                <TradeFeed events={events} />
                <ClosedTradesTable trades={portfolio.closed_trades} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
