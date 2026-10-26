"use client";

import { Activity, ArrowDownRight, ArrowUpRight, CircleHelp, Command, Layers3, Radio } from "lucide-react";
import { useRef, useState } from "react";
import OrderBook from "../components/OrderBook";
import OrderForm, { type OrderSubmission } from "../components/OrderForm";
import TradeTicker, { type ExecutedTrade } from "../components/TradeTicker";
import { MatchingEngine, type OrderBookSnapshot, type OrderRequest } from "../engine/matchingEngine";

function createDemoEngine(): MatchingEngine {
  const engine = new MatchingEngine();
  const demoOrders = [
    { id: "demo-bid-1", side: "buy", type: "limit", price: 67418, quantity: 0.82 },
    { id: "demo-bid-2", side: "buy", type: "limit", price: 67402, quantity: 1.35 },
    { id: "demo-bid-3", side: "buy", type: "limit", price: 67388, quantity: 0.64 },
    { id: "demo-bid-4", side: "buy", type: "limit", price: 67370, quantity: 1.12 },
    { id: "demo-bid-5", side: "buy", type: "limit", price: 67352, quantity: 0.48 },
    { id: "demo-ask-1", side: "sell", type: "limit", price: 67436, quantity: 0.56 },
    { id: "demo-ask-2", side: "sell", type: "limit", price: 67452, quantity: 1.08 },
    { id: "demo-ask-3", side: "sell", type: "limit", price: 67468, quantity: 0.73 },
    { id: "demo-ask-4", side: "sell", type: "limit", price: 67484, quantity: 1.42 },
    { id: "demo-ask-5", side: "sell", type: "limit", price: 67500, quantity: 0.91 },
  ] as const;

  for (const order of demoOrders) {
    engine.submitOrder(order);
  }

  return engine;
}

export default function Home() {
  const [engine] = useState(createDemoEngine);
  const [book, setBook] = useState<OrderBookSnapshot>(() => engine.getOrderBook());
  const [trades, setTrades] = useState<ExecutedTrade[]>([]);
  const [orderError, setOrderError] = useState<string | null>(null);
  const orderSequence = useRef(0);
  const bestBid = book.bids[0]?.price;
  const bestAsk = book.asks[0]?.price;

  function submitOrder(order: OrderSubmission) {
    orderSequence.current += 1;
    const id = `user-order-${orderSequence.current}`;
    setOrderError(null);

    try {
      const request: OrderRequest = order.type === "limit"
        ? {
            id,
            side: order.side,
            type: "limit",
            price: order.price ?? 0,
            quantity: order.quantity,
          }
        : {
            id,
            side: order.side,
            type: "market",
            quantity: order.quantity,
          };
      const result = engine.submitOrder(request);

      if (result.length > 0) {
        const executedAt = new Date().toISOString();
        setTrades((current) => [
          ...result.map((trade, index) => ({
            ...trade,
            id: `${id}-fill-${index}`,
            side: order.side,
            timestamp: executedAt,
          })),
          ...current,
        ].slice(0, 50));
      }

      setBook(engine.getOrderBook());
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Unable to submit this order.");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--background)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" aria-label="QuantMatch home" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent-surface)] text-[var(--accent)]">
              <Layers3 size={18} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              Quant<span className="text-[var(--accent)]">Match</span>
              <span className="ml-1.5 text-[10px] font-medium text-[var(--text-muted)]">LITE</span>
            </span>
          </a>

          <div className="hidden items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 md:flex">
            <Radio size={13} className="text-[var(--bid)]" aria-hidden="true" />
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Matching engine</span>
            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[var(--bid)]" />
            <span className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Online</span>
          </div>

          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <button type="button" aria-label="Keyboard shortcuts" className="hidden size-9 items-center justify-center rounded-lg border border-[var(--line)] transition-colors hover:bg-[var(--surface-raised)] sm:flex">
              <Command size={15} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Help" className="flex size-9 items-center justify-center rounded-lg border border-[var(--line)] transition-colors hover:bg-[var(--surface-raised)]">
              <CircleHelp size={16} aria-hidden="true" />
            </button>
            <span className="ml-1 hidden h-8 w-px bg-[var(--line)] sm:block" />
            <span className="ml-1 flex size-8 items-center justify-center rounded-full bg-[var(--surface-raised)] text-[10px] font-semibold text-[var(--text-secondary)]">QM</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-7 sm:px-6 lg:px-8">
        <section className="mb-6 flex flex-col justify-between gap-5 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
              <span>Markets</span><span className="text-[var(--line-strong)]">/</span><span>Spot</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-[var(--surface-raised)] font-mono text-sm font-bold text-[var(--text-primary)]">₿</span>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">BTC / USD</h1>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">Bitcoin <span className="px-1">·</span> US Dollar</p>
                </div>
              </div>
              <span className="hidden h-9 w-px bg-[var(--line)] sm:block" />
              <div>
                <p className="font-mono text-xl font-semibold tracking-tight">
                  ${bestBid && bestAsk ? ((bestBid + bestAsk) / 2).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "--"}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--bid)]">
                  <ArrowUpRight size={12} aria-hidden="true" /> Live mid price
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 sm:pb-1">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Best bid</p>
              <p className="mt-1 font-mono text-xs text-[var(--bid)]">{bestBid ? `$${bestBid.toLocaleString("en-US")}` : "--"}</p>
            </div>
            <div className="hidden h-8 w-px bg-[var(--line)] sm:block" />
            <div className="hidden text-right sm:block">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Best ask</p>
              <p className="mt-1 font-mono text-xs text-[var(--ask)]">{bestAsk ? `$${bestAsk.toLocaleString("en-US")}` : "--"}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
              <Activity size={14} className="text-[var(--accent)]" aria-hidden="true" />
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">Spot</span>
              <ArrowDownRight size={12} className="text-[var(--text-muted)]" aria-hidden="true" />
            </div>
          </div>
        </section>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(250px,0.88fr)_minmax(380px,1.25fr)_minmax(250px,0.88fr)]">
          <div className="order-2 xl:order-1">
            <OrderForm onSubmit={submitOrder} bestBid={bestBid} bestAsk={bestAsk} />
            {orderError ? (
              <p role="alert" className="mt-3 rounded-lg border border-[var(--danger-line)] bg-[var(--danger-surface)] px-4 py-3 text-xs text-[var(--danger)]">
                {orderError}
              </p>
            ) : null}
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-[11px] leading-relaxed text-[var(--text-muted)]">
              <CircleHelp size={14} className="mt-0.5 shrink-0 text-[var(--text-secondary)]" aria-hidden="true" />
              <p>Orders are matched locally using deterministic price-time priority. Market orders only execute against available liquidity.</p>
            </div>
          </div>

          <div className="order-1 xl:order-2">
            <OrderBook book={book} />
          </div>

          <div className="order-3 xl:order-3">
            <TradeTicker trades={trades} />
          </div>
        </div>

        <footer className="mt-6 flex flex-col justify-between gap-2 border-t border-[var(--line)] pt-4 text-[10px] text-[var(--text-muted)] sm:flex-row sm:items-center">
          <p className="flex items-center gap-2"><span className="status-dot" /> Local matching simulation <span className="text-[var(--line-strong)]">·</span> No external data feed</p>
          <p className="font-mono">QuantMatch-Lite <span className="px-1">/</span> PRICE-TIME PRIORITY</p>
        </footer>
      </div>
    </main>
  );
}
