"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { OrderSide } from "../engine/matchingEngine";

export type OrderType = "limit" | "market";

export interface OrderSubmission {
  side: OrderSide;
  type: OrderType;
  price?: number;
  quantity: number;
}

interface OrderFormProps {
  onSubmit: (order: OrderSubmission) => void;
  bestBid?: number;
  bestAsk?: number;
}

export default function OrderForm({ onSubmit, bestBid, bestAsk }: OrderFormProps) {
  const [side, setSide] = useState<OrderSide>("buy");
  const [type, setType] = useState<OrderType>("limit");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericQuantity = Number(quantity);
    const numericPrice = Number(price);

    onSubmit({
      side,
      type,
      quantity: numericQuantity,
      ...(type === "limit" ? { price: numericPrice } : {}),
    });

    setQuantity("");
  }

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Place order</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Configure and submit an order</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--surface-raised)] p-1">
          <button
            type="button"
            aria-pressed={side === "buy"}
            onClick={() => setSide("buy")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-colors ${side === "buy" ? "bg-[var(--bid-surface)] text-[var(--bid)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
          >
            <ArrowDownLeft size={14} aria-hidden="true" /> Buy
          </button>
          <button
            type="button"
            aria-pressed={side === "sell"}
            onClick={() => setSide("sell")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-colors ${side === "sell" ? "bg-[var(--ask-surface)] text-[var(--ask)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
          >
            <ArrowUpRight size={14} aria-hidden="true" /> Sell
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(["limit", "market"] as const).map((orderType) => (
            <button
              key={orderType}
              type="button"
              aria-pressed={type === orderType}
              onClick={() => setType(orderType)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors ${type === orderType ? "border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              {orderType}
            </button>
          ))}
        </div>

        {type === "limit" ? (
          <label className="block space-y-2">
            <span className="flex justify-between text-xs font-medium text-[var(--text-secondary)]">
              Limit price <span className="text-[var(--text-muted)]">USD</span>
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder={bestBid ? bestBid.toFixed(2) : "0.00"}
              className="terminal-input font-mono"
            />
          </label>
        ) : (
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-3 text-xs text-[var(--text-muted)]">
            Market orders execute against available liquidity at current prices.
          </div>
        )}

        <label className="block space-y-2">
          <span className="flex justify-between text-xs font-medium text-[var(--text-secondary)]">
            Quantity <span className="text-[var(--text-muted)]">BTC</span>
          </span>
          <input
            type="number"
            min="0.0001"
            step="0.0001"
            required
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="0.0000"
            className="terminal-input font-mono"
          />
        </label>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">Best {side === "buy" ? "ask" : "bid"}</span>
          <span className="font-mono text-[var(--text-secondary)]">
            {(side === "buy" ? bestAsk : bestBid) === undefined
              ? "--"
              : `$${(side === "buy" ? bestAsk : bestBid)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
        </div>

        <button
          type="submit"
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-colors ${side === "buy" ? "bg-[var(--bid)] text-[var(--button-contrast)] hover:brightness-110" : "bg-[var(--ask)] text-[var(--button-contrast)] hover:brightness-110"}`}
        >
          {side === "buy" ? "Buy BTC" : "Sell BTC"}
        </button>
      </form>
    </section>
  );
}
