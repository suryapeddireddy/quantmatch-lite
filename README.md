# QuantMatch-Lite

A deterministic, single-threaded limit order book and BTC/USD trading dashboard built with Next.js, TypeScript, and a pure-TypeScript matching engine. The project demonstrates price-time priority, order-book data structures, and a reproducible engine benchmark in a compact portfolio application.

## Features

- Buy and sell limit and market orders
- Price-time priority with partial and complete fills
- Aggregated Level 2 bids and asks, spread, and cumulative depth chart
- Recent execution ticker and synthetic order-flow simulation
- Deterministic benchmark for 10,000 or more randomly generated orders
- Vitest coverage for matching priority, fills, and price-level cleanup

## Architecture

The matching engine is isolated from React and owns the in-memory book. The dashboard submits orders to one persistent engine instance and renders snapshots and executions.

| Area | Responsibility |
| --- | --- |
| [`src/engine/`](./src/engine/) | Pure TypeScript order types, price levels, matching rules, and benchmark |
| [`src/components/`](./src/components/) | Order entry, aggregated order book, depth chart, and trade ticker |
| [`src/app/`](./src/app/) | Next.js App Router page, styling, and application metadata |
| [`.context/`](./.context/) | Product, architecture, code-standard, workflow, and progress guidance |

### Book data structures and complexity

Each side of the book is a `Map<number, PriceLevel>` keyed by price. A price level stores its FIFO orders in a singly linked list with head and tail pointers, alongside an aggregate quantity:

- Looking up, creating, or removing a price level uses expected **O(1)** `Map` operations.
- Appending a resting order and consuming its head order are **O(1)** operations.
- Aggregate displayed quantity is maintained incrementally, avoiding a scan of all orders at a level.
- Empty levels are removed as soon as their final order is filled.

These are O(1) order-management primitives, not an O(1) full matching algorithm. The current matcher sorts the opposing side's price keys for each submission, so price discovery costs **O(L log L)** in the number of opposing price levels `L` in the worst case. Producing a sorted book snapshot also costs **O(L log L)**. This implementation favors clarity and deterministic behavior; a price index or heap/tree would be a next step for scaling price discovery.

## Matching rules

1. **Best price first:** incoming buys consume the lowest asks first; incoming sells consume the highest bids first.
2. **FIFO at a price:** orders at the same price level fill in arrival order.
3. **Limit crossing:** a limit order matches only prices at or better than its limit price. Any remaining quantity rests at its limit price.
4. **Market execution:** market orders consume available opposing liquidity without a price bound. Any unfilled remainder is discarded rather than added to the book.
5. **Maker price:** each trade executes at the resting order's price.
6. **Determinism:** identical order sequences produce identical trades and book state.

The engine accepts finite positive prices and quantities and non-empty order IDs. Quantities may be fractional. Order cancellation, persistence, network APIs, and exchange connectivity are outside this demo's scope.

## Requirements and setup

Use Node.js **20.19 or newer** and npm. This satisfies the current Next.js toolchain and ESLint dependency engine requirements.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the dashboard.

### Project commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run test` | Run the Vitest engine test suite |
| `npm run lint` | Run ESLint |
| `npm run benchmark` | Benchmark 100,000 generated orders |
| `npm run benchmark -- 10000` | Benchmark a chosen count (minimum 10,000) |
| `npm run build` | Create the optimized production build and run the Next.js TypeScript check |
| `npm run start` | Serve a previously built production application |

## Performance benchmark

Run the benchmark with:

```bash
npm run benchmark
npm run benchmark -- 250000
```

The harness creates a seeded, repeatable stream before timing: 50% buy / 50% sell, with 75% limit / 25% market orders, randomized quantities, and limit prices across a bounded range. It warms the engine with up to 10,000 orders, then times synchronous `submitOrder` processing on a fresh engine. Order generation and warm-up are excluded from the measurement. It reports elapsed time, total measured orders, throughput (orders per second), average wall-clock execution latency (microseconds per submitted order), trade count, and remaining price-level count.

Reference run: **100,000 orders** after a 10,000-order warm-up, Node.js **v20.17.0** on **Windows x64**; **626,082 orders/second**, **1.60 µs average latency**, 98,102 trades, and 32 remaining price levels. These are machine- and runtime-dependent, single-run figures; rerun the command for a current measurement and do not treat this sample as a production capacity guarantee. For comparable measurements, use the same Node.js version, machine, and order count, and avoid competing workloads.

## Production deployment

The repository includes [`vercel.json`](./vercel.json) to select the Next.js framework and run `npm ci` followed by `npm run build`. Import the repository into Vercel to deploy; no application secrets or environment variables are required for the demo.

For a Node.js host, install dependencies, build, and start the production server:

```bash
npm ci
npm run build
npm run start
```

The matching engine and dashboard state are in memory and local to the running application instance. This project is an educational/portfolio demo, not a production exchange: it does not provide durable order storage, multi-instance coordination, authentication, or exchange-grade operational controls.
