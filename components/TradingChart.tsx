"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries, HistogramSeries, IChartApi, ISeriesApi, CandlestickData, Time } from "lightweight-charts";
import { useWebSocket } from "@/context/WebSocketContext";

export default function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const { selectedSymbol, prices, connected } = useWebSocket();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0f0f1a" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#1a1a2e" },
        horzLines: { color: "#1a1a2e" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#374151",
      },
      timeScale: {
        borderColor: "#374151",
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    // Candlestick series - v5 API using class
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    // Volume series - v5 API using class
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#6b7280",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Fetch historical data from Kraken
    const fetchData = async () => {
      const symbolMap: Record<string, string> = {
        "BTC/USD": "XXBTZUSD",
        "ETH/USD": "XETHZUSD",
        "SOL/USD": "SOLUSD",
        "XRP/USD": "XXRPZUSD",
        "ADA/USD": "ADAUSD",
      };
      
      const krakenSymbol = symbolMap[selectedSymbol] || "XXBTZUSD";
      
      try {
        const response = await fetch(
          `https://api.kraken.com/0/public/OHLC?pair=${krakenSymbol}&interval=60`
        );
        const data = await response.json();
        
        if (data.error?.length) {
          console.error("Kraken API error:", data.error);
          return;
        }

        const ohlcData = data.result[Object.keys(data.result)[0]];
        const candles: CandlestickData[] = [];
        const volumeData: { time: Time; value: number; color: string }[] = [];

        ohlcData.forEach((candle: any[]) => {
          const time = (candle[0] / 1000) as Time;
          const open = parseFloat(candle[1]);
          const high = parseFloat(candle[2]);
          const low = parseFloat(candle[3]);
          const close = parseFloat(candle[4]);
          const volume = parseFloat(candle[6]);

          candles.push({ time, open, high, low, close });
          volumeData.push({
            time,
            value: volume,
            color: close >= open ? "#22c55e80" : "#ef444480",
          });
        });

        candleSeries.setData(candles);
        volumeSeries.setData(volumeData);
        chart.timeScale().fitContent();
      } catch (error) {
        console.error("Failed to fetch Kraken data:", error);
      }
    };

    fetchData();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries as any;
    volumeSeriesRef.current = volumeSeries as any;

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [selectedSymbol]);

  // Update with real-time price from WebSocket
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !prices[selectedSymbol]) return;

    const price = prices[selectedSymbol];
    const now = Math.floor(Date.now() / 1000) as Time;
    
    const candleData = {
      time: now,
      open: price.mark,
      high: price.ask,
      low: price.bid,
      close: price.mark,
    };

    const volumeData = {
      time: now,
      value: 100,
      color: "#6b7280",
    };

    candleSeriesRef.current.update(candleData);
    volumeSeriesRef.current.update(volumeData);
  }, [prices, selectedSymbol]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-100">
            {selectedSymbol}
          </h2>
          {prices[selectedSymbol] && (
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono">
                ${prices[selectedSymbol].bid.toLocaleString()}
              </span>
              <span className="text-gray-500">/</span>
              <span className="text-red-400 font-mono">
                ${prices[selectedSymbol].ask.toLocaleString()}
              </span>
            </div>
          )}
        </div>
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
      <div
        ref={chartContainerRef}
        className="w-full h-[400px] rounded overflow-hidden"
      />
    </div>
  );
}
