"use client";

import { useWebSocket } from "@/context/WebSocketContext";

const AVAILABLE_SYMBOLS = ["BTC/USD", "ETH/USD", "SOL/USD", "XRP/USD", "ADA/USD"];

export default function PriceTicker() {
  const { prices, selectedSymbol, setSelectedSymbol, connected } = useWebSocket();

  const currentPrice = prices[selectedSymbol];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-100">Live Prices</h2>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              connected ? "bg-green-400" : "bg-gray-500"
            }`}
          />
          <span className="text-xs text-gray-500">
            {connected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {/* Symbol Selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {AVAILABLE_SYMBOLS.map((sym) => (
          <button
            key={sym}
            onClick={() => setSelectedSymbol(sym)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selectedSymbol === sym
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Price Display */}
      {currentPrice ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Bid</p>
            <p className="text-xl font-mono text-green-400">
              ${currentPrice.bid.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Ask</p>
            <p className="text-xl font-mono text-red-400">
              ${currentPrice.ask.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Mark</p>
            <p className="text-xl font-mono text-gray-100">
              ${currentPrice.mark.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Spread</p>
            <p className="text-xl font-mono text-gray-400">
              ${currentPrice.spread.toFixed(2)}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Waiting for price data...</p>
          <p className="text-sm mt-1">Select a symbol above</p>
        </div>
      )}

      {/* All Prices Overview */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-2">All Markets</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {AVAILABLE_SYMBOLS.map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`text-left p-2 rounded ${
                selectedSymbol === sym ? "bg-gray-700" : "bg-gray-800"
              } hover:bg-gray-700 transition-colors`}
            >
              <p className="text-xs text-gray-400">{sym}</p>
              <p className="text-sm font-mono text-gray-200">
                ${prices[sym]?.mark?.toLocaleString() ?? "—"}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
