"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OrderBookSnapshot } from "../engine/matchingEngine";

interface DepthChartProps {
  book: OrderBookSnapshot;
}

interface DepthPoint {
  price: number;
  bids: number | null;
  asks: number | null;
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatQuantity(quantity: number): string {
  return quantity.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export default function DepthChart({ book }: DepthChartProps) {
  const prices = [...new Set([
    ...book.bids.map((level) => level.price),
    ...book.asks.map((level) => level.price),
  ])].sort((a, b) => a - b);

  const bestBid = book.bids[0]?.price;
  const bestAsk = book.asks[0]?.price;
  const data: DepthPoint[] = prices.map((price) => ({
    price,
    bids: bestBid !== undefined && price <= bestBid
      ? book.bids.reduce(
          (total, level) => total + (level.price >= price ? level.quantity : 0),
          0,
        )
      : null,
    asks: bestAsk !== undefined && price >= bestAsk
      ? book.asks.reduce(
          (total, level) => total + (level.price <= price ? level.quantity : 0),
          0,
        )
      : null,
  }));

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Market depth</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Cumulative liquidity by price</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--bid)]" /> Bids
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--ask)]" /> Asks
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-xs text-[var(--text-muted)]">
          No liquidity to chart
        </div>
      ) : (
        <div className="h-56 px-3 pb-3 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="bid-depth-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--bid)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--bid)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="ask-depth-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ask)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--ask)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="price"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatPrice}
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "var(--line)" }}
                minTickGap={24}
              />
              <YAxis
                width={42}
                tickFormatter={formatQuantity}
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: "0.5rem",
                  color: "var(--text-primary)",
                  fontSize: 11,
                }}
                labelFormatter={(label) => `$${formatPrice(Number(label))}`}
                formatter={(value, name) => [
                  `${formatQuantity(Number(value))} BTC`,
                  name === "bids" ? "Bid depth" : "Ask depth",
                ]}
              />
              <Area
                type="stepAfter"
                dataKey="bids"
                name="bids"
                stroke="var(--bid)"
                strokeWidth={2}
                fill="url(#bid-depth-fill)"
                connectNulls={false}
                isAnimationActive={false}
              />
              <Area
                type="stepAfter"
                dataKey="asks"
                name="asks"
                stroke="var(--ask)"
                strokeWidth={2}
                fill="url(#ask-depth-fill)"
                connectNulls={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
