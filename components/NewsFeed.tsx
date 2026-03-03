"use client";

import { useWebSocket } from "@/context/WebSocketContext";

export default function NewsFeed() {
  const { news, connected } = useWebSocket();

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "URGENT":
        return "bg-red-500/20 border-red-500 text-red-400";
      case "IMPORTANT":
        return "bg-yellow-500/20 border-yellow-500 text-yellow-400";
      case "ROUTINE":
        return "bg-blue-500/20 border-blue-500 text-blue-400";
      default:
        return "bg-gray-500/20 border-gray-500 text-gray-400";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "BULLISH":
        return "text-green-400";
      case "BEARISH":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (news.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">News Feed</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Waiting for news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-100">News Feed</h2>
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

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {news.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={`p-3 rounded-lg border ${getUrgencyColor(item.urgency)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-black/30">
                    {item.urgency}
                  </span>
                  <span className={`text-sm font-medium ${getSentimentColor(item.sentiment)}`}>
                    {item.sentiment}
                  </span>
                </div>
                <p className="text-sm text-gray-200 mb-2">{item.summary}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  {item.affected_assets.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-blue-400">
                        {item.affected_assets.join(", ")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
