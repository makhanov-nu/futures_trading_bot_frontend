"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Portfolio, TradeEvent, SnapshotMessage } from "@/types/trading";

const MAX_EVENTS = 50;
const BASE_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

interface WebSocketState {
  portfolio: Portfolio | null;
  events: TradeEvent[];
  connected: boolean;
  lastUpdated: string | null;
}

interface WebSocketContextValue extends WebSocketState {}

const WebSocketContext = createContext<WebSocketContextValue>({
  portfolio: null,
  events: [],
  connected: false,
  lastUpdated: null,
});

export function useWebSocket(): WebSocketContextValue {
  return useContext(WebSocketContext);
}

interface Props {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: Props) {
  const [state, setState] = useState<WebSocketState>({
    portfolio: null,
    events: [],
    connected: false,
    lastUpdated: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef<number>(BASE_RECONNECT_DELAY_MS);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) return;
      reconnectDelayRef.current = BASE_RECONNECT_DELAY_MS;
      setState((prev) => ({ ...prev, connected: true }));
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;

      let parsed: SnapshotMessage | TradeEvent;
      try {
        parsed = JSON.parse(event.data as string) as
          | SnapshotMessage
          | TradeEvent;
      } catch {
        return;
      }

      if (parsed.type === "snapshot") {
        const msg = parsed as SnapshotMessage;
        setState((prev) => ({
          ...prev,
          portfolio: msg.portfolio,
          lastUpdated: msg.timestamp,
        }));
      } else if (parsed.type === "trade_event") {
        const msg = parsed as TradeEvent;
        setState((prev) => ({
          ...prev,
          events: [msg, ...prev.events].slice(0, MAX_EVENTS),
        }));
      }
    };

    ws.onerror = () => {
      // onclose fires immediately after onerror — reconnect logic lives there
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;

      setState((prev) => ({ ...prev, connected: false }));
      wsRef.current = null;

      const delay = reconnectDelayRef.current;
      reconnectDelayRef.current = Math.min(
        delay * 2,
        MAX_RECONNECT_DELAY_MS
      );

      reconnectTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) connect();
      }, delay);
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect loop on unmount
        wsRef.current.close();
      }
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={state}>
      {children}
    </WebSocketContext.Provider>
  );
}
