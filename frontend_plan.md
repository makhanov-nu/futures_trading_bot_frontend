# Plan: Monorepo Restructure + Real-Time Dashboard

## Context
Move all existing Python trading bot code into `backend/` and build a Next.js + TypeScript
real-time dashboard in `frontend/`. The frontend connects to the FastAPI server (already
running on port 8080) via WebSocket for live portfolio updates and trade events.

---

## Key Discovery: Paths Stay Correct After Move

All Python files use `Path(__file__).parent.parent / "data"` (2 levels up).
After moving `execution/paper_trader.py` → `backend/execution/paper_trader.py`,
`.parent.parent` resolves to `backend/` — which is correct, since `data/`, `logs/`,
and `config/` will also live inside `backend/`. **No path changes needed in any Python file.**

`load_dotenv()` uses auto-discovery (searches parent dirs) — `.env` at repo root is found
regardless of working directory. No changes needed.

---

## Scope

| Area | Files |
|------|-------|
| `git mv` (12 dirs/files) | All tracked Python dirs + requirements.txt + docs |
| `.gitignore` update | `data/` → `backend/data/`, `logs/` → `backend/logs/` |
| New: `backend/collectors/dashboard_api.py` | WebSocket + REST API for frontend |
| Modified: `backend/execution/paper_trader.py` | Add trade event callback hook |
| Modified: `backend/collectors/tv_webhook.py` | Add CORS + mount dashboard router |
| Modified: `backend/core/scheduler.py` | Wire dashboard broadcaster |
| New: `frontend/` | Full Next.js app (7 files) |
| `deploy/trading-bot.service` | Update paths to `backend/` |

---

## Part 1 — Backend Reorganisation

### 1a. `git mv` everything into `backend/`

```bash
mkdir backend
git mv analysis backtesting collectors config core deploy \
        execution memory notifications \
        requirements.txt verification_tests.py \
        .env.example SESSION_SUMMARY.md \
        CLAUDE_trading_research.md openclaw.md backend/
```

### 1b. Update `.gitignore`
Change `data/` → `backend/data/` and `logs/*.log` → `backend/logs/*.log`.
Add `frontend/.next/` and `frontend/node_modules/`.

### 1c. Create empty tracked dirs inside `backend/`
```
backend/data/.gitkeep
backend/logs/.gitkeep
```
So the runtime directories exist after a fresh clone.

### 1d. Update `backend/deploy/trading-bot.service`
Change `WorkingDirectory=/opt/trading` → `WorkingDirectory=/opt/trading/backend`

### 1e. Root `Makefile` for convenience
```makefile
run-backend:
    cd backend && ../venv/bin/python -m core.scheduler
run-frontend:
    cd frontend && npm run dev
install:
    pip install -r backend/requirements.txt
    cd frontend && npm install
```

---

## Part 2 — Dashboard API (backend)

### New file: `backend/collectors/dashboard_api.py`

**`ConnectionManager`** — tracks active WebSocket clients:
```python
class ConnectionManager:
    async def connect(ws)
    def disconnect(ws)
    async def broadcast(message: dict)
```

**`BroadcastService`** — background asyncio task, runs every 2s:
```python
async def run(trader):
    while True:
        snapshot = _build_snapshot(trader)
        await manager.broadcast(snapshot)
        await asyncio.sleep(2)
```

**`_build_snapshot(trader)`** — JSON-serialisable dict:
```python
{
  "type": "snapshot",
  "timestamp": ...,
  "portfolio": {
    "equity": ..., "cash": ..., "pnl_pct": ...,
    "daily_pnl_pct": ..., "drawdown_pct": ...,
    "sharpe_ratio": ..., "win_rate": ..., "total_trades": ...,
    "open_positions": [...],   # includes unrealised_pnl
    "closed_trades": [...]     # full list for chart + table
  }
}
```

**`emit_trade_event(event: dict)`** — non-blocking, called from paper_trader on each trade.

**FastAPI router** endpoints:
- `GET /api/portfolio` — one-off snapshot (initial page load)
- `GET /api/trades` — closed trades list
- `WS /ws` — live stream

### Modified: `backend/execution/paper_trader.py`

Add event callback at module level:
```python
_event_callback = None
def set_event_callback(cb): global _event_callback; _event_callback = cb
def _emit(event):
    if _event_callback: _event_callback(event)
```

Call `_emit(...)` in `open()`, `_close_position()`, and `_liquidate()`.

### Modified: `backend/collectors/tv_webhook.py`

Add CORS middleware and include dashboard router:
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)
from collectors.dashboard_api import router as dashboard_router
app.include_router(dashboard_router)
```

### Modified: `backend/core/scheduler.py`

```python
from collectors.dashboard_api import run as dashboard_run, emit_trade_event
from execution.paper_trader import set_event_callback

# In main(), after scheduler.start():
dashboard_set_trader(shared_trader)
set_event_callback(emit_trade_event)
asyncio.create_task(dashboard_run(shared_trader))
```

---

## Part 3 — Next.js Frontend

### Stack
- Next.js 15, TypeScript, Tailwind CSS, `recharts` (equity chart)
- Dark theme throughout
- WebSocket connects to `ws://localhost:8080/ws`

### File structure
```
frontend/
├── app/
│   ├── page.tsx              ← Dashboard grid (4 panels)
│   ├── layout.tsx            ← Root layout + WebSocketProvider
│   └── globals.css           ← @tailwind directives
├── components/
│   ├── PortfolioCard.tsx     ← Equity, cash, PnL%, drawdown, Sharpe, win rate
│   ├── PositionsTable.tsx    ← Open positions: side badge, entry, notional, uPnL, liq
│   ├── PnLChart.tsx          ← recharts AreaChart of equity over time
│   ├── TradeFeed.tsx         ← Scrolling list of last 50 trade events
│   └── ClosedTradesTable.tsx ← Sortable table of all closed trades
├── context/
│   └── WebSocketContext.tsx  ← Provider that owns WS connection + shared state
├── types/
│   └── trading.ts            ← Portfolio, Position, ClosedTrade, TradeEvent interfaces
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

### WebSocket message contracts
```typescript
// Every 2s:
type SnapshotMessage = {
  type: "snapshot";
  timestamp: string;
  portfolio: Portfolio;
};

// On each trade:
type TradeEventMessage = {
  type: "trade_event";
  event: "open" | "close" | "stop_loss" | "take_profit" | "liquidation";
  symbol: string; side: string; price: number;
  pnl?: number; reason: string; timestamp: string;
};
```

### Dashboard layout (page.tsx)
```
┌──────────────────────────────────────────────────────┐
│  AQQYL Futures Dashboard                  🟢 Live   │
├────────────────────┬─────────────────────────────────┤
│  PortfolioCard     │  PnLChart (equity curve)         │
│  equity / drawdown │                                  │
├────────────────────┴─────────────────────────────────┤
│  PositionsTable (open positions with live uPnL)       │
├────────────────────┬─────────────────────────────────┤
│  TradeFeed (live)  │  ClosedTradesTable               │
└────────────────────┴─────────────────────────────────┘
```

---

## Verification

```bash
# 1. Backend imports resolve from new location
cd backend && ../venv/bin/python -c "from core.scheduler import build_scheduler; print('OK')"

# 2. Dashboard API reachable
curl http://localhost:8080/api/portfolio
curl http://localhost:8080/health

# 3. Frontend builds cleanly
cd frontend && npm run build

# 4. Live: open http://localhost:3000
#    Confirm WebSocket connects (🟢 Live indicator)
#    Confirm all 4 panels populate with data
```
