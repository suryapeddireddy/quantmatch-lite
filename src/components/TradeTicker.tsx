import { ArrowDownLeft, ArrowUpRight, Clock3 } from "lucide-react";
import type { OrderSide, Trade } from "../engine/matchingEngine";

export interface ExecutedTrade extends Trade {
  id: string;
  side: OrderSide;
  timestamp: string;
}

interface TradeTickerProps {
  trades: ExecutedTrade[];
}

function formatTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

export default function TradeTicker({ trades }: TradeTickerProps) {
  return (
    <section className="panel flex min-h-[30rem] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent trades</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Latest executions</p>
        </div>
        <span className="rounded-md bg-[var(--surface-raised)] px-2 py-1 font-mono text-[10px] text-[var(--text-secondary)]">
          {trades.length.toString().padStart(2, "0")}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3 px-5 pb-2 pt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
        <span>Price / side</span>
        <span className="text-right">Qty / time</span>
      </div>

      <div className="flex-1 divide-y divide-[var(--line)] overflow-y-auto px-5">
        {trades.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-[var(--surface-raised)] text-[var(--text-muted)]">
              <Clock3 size={17} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium text-[var(--text-secondary)]">No trades yet</p>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">Executed orders will appear here</p>
            </div>
          </div>
        ) : trades.map((trade) => (
          <div key={trade.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className={`font-mono text-xs font-semibold ${trade.side === "buy" ? "text-[var(--bid)]" : "text-[var(--ask)]"}`}>
                ${trade.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="mt-1 flex items-center gap-1 text-[10px] uppercase text-[var(--text-muted)]">
                {trade.side === "buy"
                  ? <ArrowDownLeft size={11} aria-hidden="true" />
                  : <ArrowUpRight size={11} aria-hidden="true" />}
                {trade.side}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-[var(--text-primary)]">
                {trade.quantity.toLocaleString("en-US", { maximumFractionDigits: 4 })}
              </p>
              <time dateTime={trade.timestamp} className="mt-1 block font-mono text-[10px] text-[var(--text-muted)]">
                {formatTime(trade.timestamp)}
              </time>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
