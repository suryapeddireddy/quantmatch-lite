# Architecture Context: QuantMatch-Lite

## Stack

| Layer       | Technology              | Role                                        |
| ----------- | ----------------------- | ------------------------------------------- |
| Framework   | Next.js 16 + TypeScript | Full-stack application runtime              |
| Styling     | Tailwind CSS            | Component styling and dark-mode layout      |
| Icons       | Lucide React            | UI and status indicators                    |
| Charting    | Recharts                | Depth chart and price curves visualization  |
| Core Engine | Pure TypeScript         | Deterministic LOB state machine & match loop|

## System Boundaries

- `src/engine/` — Pure business logic, order book data structures, matching rules, and state transitions. No UI code here.
- `src/components/` — Modular React UI components (OrderBook table, DepthChart, OrderForm, TradeTicker).
- `src/app/` — Next.js App router pages wiring the engine state into the user interface.

## Invariants

1. **Price-Time Priority**: Bids must match highest price first, then earliest timestamp. Asks must match lowest price first, then earliest timestamp.
2. **Determinism**: Given an identical sequence of orders, the engine must produce an identical sequence of trades and book states.
3. **Engine Isolation**: The matching engine must remain entirely decoupled from React state hooks so it can be unit tested independently.