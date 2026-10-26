import type { OrderBookSnapshot } from "../engine/matchingEngine";

interface OrderBookProps {
  book: OrderBookSnapshot;
}

const visibleLevels = 8;

function formatNumber(value: number, maximumFractionDigits = 4): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

export default function OrderBook({ book }: OrderBookProps) {
  const asks = book.asks.slice(0, visibleLevels);
  const bids = book.bids.slice(0, visibleLevels);
  const bestBid = bids[0]?.price;
  const bestAsk = asks[0]?.price;
  const spread = bestBid !== undefined && bestAsk !== undefined
    ? bestAsk - bestBid
    : undefined;
  const maxDepth = Math.max(
    ...asks.map((level) => level.quantity),
    ...bids.map((level) => level.quantity),
    1,
  );

  const askRows = [...asks].reverse().map((level, index, levels) => {
    const depth = levels
      .slice(index)
      .reduce((total, current) => total + current.quantity, 0);
    return { ...level, depth };
  });

  let bidDepth = 0;

  return (
    <section className="panel flex min-h-[30rem] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Order book</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Aggregated market depth</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
          <span className="status-dot" />
          LEVEL 2
        </div>
      </div>

      <div className="grid grid-cols-3 px-5 pb-2 pt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
        <span>Price (USD)</span>
        <span className="text-right">Size (BTC)</span>
        <span className="text-right">Total (BTC)</span>
      </div>

      <div className="space-y-0.5 px-3 font-mono text-xs tabular-nums">
        {askRows.length === 0 ? (
          <p className="py-8 text-center text-xs text-[var(--text-muted)]">No asks on the book</p>
        ) : askRows.map((level) => (
          <div key={`ask-${level.price}`} className="depth-row relative grid grid-cols-3 rounded-md px-2 py-1.5">
            <span
              className="depth-bar bg-[var(--ask-depth)]"
              style={{ width: `${Math.min((level.depth / maxDepth) * 100, 100)}%` }}
            />
            <span className="relative z-10 text-[var(--ask)]">{formatNumber(level.price, 2)}</span>
            <span className="relative z-10 text-right text-[var(--text-secondary)]">{formatNumber(level.quantity)}</span>
            <span className="relative z-10 text-right text-[var(--text-muted)]">{formatNumber(level.depth)}</span>
          </div>
        ))}
      </div>

      <div className="my-3 flex items-center justify-between border-y border-[var(--line)] bg-[var(--surface-raised)] px-5 py-3 font-mono">
        <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Spread</span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {spread === undefined ? "--" : `$${formatNumber(spread, 2)}`}
          {spread !== undefined && bestAsk
            ? <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">({((spread / bestAsk) * 100).toFixed(3)}%)</span>
            : null}
        </span>
      </div>

      <div className="space-y-0.5 px-3 pb-4 font-mono text-xs tabular-nums">
        {bids.length === 0 ? (
          <p className="py-8 text-center text-xs text-[var(--text-muted)]">No bids on the book</p>
        ) : bids.map((level) => {
          bidDepth += level.quantity;
          return (
            <div key={`bid-${level.price}`} className="depth-row relative grid grid-cols-3 rounded-md px-2 py-1.5">
              <span
                className="depth-bar bg-[var(--bid-depth)]"
                style={{ width: `${Math.min((bidDepth / maxDepth) * 100, 100)}%` }}
              />
              <span className="relative z-10 text-[var(--bid)]">{formatNumber(level.price, 2)}</span>
              <span className="relative z-10 text-right text-[var(--text-secondary)]">{formatNumber(level.quantity)}</span>
              <span className="relative z-10 text-right text-[var(--text-muted)]">{formatNumber(bidDepth)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
