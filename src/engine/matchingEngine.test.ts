import { describe, expect, it } from "vitest";
import { MatchingEngine } from "./matchingEngine";

describe("MatchingEngine", () => {
  it("matches the best price first and preserves time priority at each level", () => {
    const engine = new MatchingEngine();
    engine.submitOrder({
      id: "older-bid",
      side: "buy",
      type: "limit",
      price: 100,
      quantity: 1,
    });
    engine.submitOrder({
      id: "newer-bid",
      side: "buy",
      type: "limit",
      price: 100,
      quantity: 1,
    });
    engine.submitOrder({
      id: "best-bid",
      side: "buy",
      type: "limit",
      price: 101,
      quantity: 1,
    });

    const trades = engine.submitOrder({
      id: "incoming-sell",
      side: "sell",
      type: "market",
      quantity: 3,
    });

    expect(trades).toEqual([
      {
        buyOrderId: "best-bid",
        sellOrderId: "incoming-sell",
        price: 101,
        quantity: 1,
      },
      {
        buyOrderId: "older-bid",
        sellOrderId: "incoming-sell",
        price: 100,
        quantity: 1,
      },
      {
        buyOrderId: "newer-bid",
        sellOrderId: "incoming-sell",
        price: 100,
        quantity: 1,
      },
    ]);
  });

  it("keeps the unfilled quantity resting after a partial fill", () => {
    const engine = new MatchingEngine();
    engine.submitOrder({
      id: "resting-ask",
      side: "sell",
      type: "limit",
      price: 100,
      quantity: 3,
    });

    const trades = engine.submitOrder({
      id: "partial-buy",
      side: "buy",
      type: "limit",
      price: 100,
      quantity: 1.25,
    });

    expect(trades).toHaveLength(1);
    expect(trades[0]).toMatchObject({
      buyOrderId: "partial-buy",
      sellOrderId: "resting-ask",
      price: 100,
      quantity: 1.25,
    });
    expect(engine.getOrderBook()).toEqual({
      bids: [],
      asks: [{ price: 100, quantity: 1.75 }],
    });
  });

  it("removes a price level when an exact fill consumes its final order", () => {
    const engine = new MatchingEngine();
    engine.submitOrder({
      id: "ask-to-fill",
      side: "sell",
      type: "limit",
      price: 100,
      quantity: 2,
    });

    const trades = engine.submitOrder({
      id: "exact-buy",
      side: "buy",
      type: "market",
      quantity: 2,
    });

    expect(trades).toEqual([{
      buyOrderId: "exact-buy",
      sellOrderId: "ask-to-fill",
      price: 100,
      quantity: 2,
    }]);
    expect(engine.getOrderBook().asks).toEqual([]);
  });

  it("prunes only emptied price levels and accepts new orders at a pruned price", () => {
    const engine = new MatchingEngine();
    engine.submitOrder({
      id: "first-ask",
      side: "sell",
      type: "limit",
      price: 100,
      quantity: 1,
    });
    engine.submitOrder({
      id: "second-ask",
      side: "sell",
      type: "limit",
      price: 101,
      quantity: 1,
    });

    engine.submitOrder({
      id: "fill-first",
      side: "buy",
      type: "market",
      quantity: 1,
    });

    expect(engine.getOrderBook().asks).toEqual([{ price: 101, quantity: 1 }]);

    engine.submitOrder({
      id: "replacement-ask",
      side: "sell",
      type: "limit",
      price: 100,
      quantity: 0.5,
    });
    expect(engine.getOrderBook().asks).toEqual([
      { price: 100, quantity: 0.5 },
      { price: 101, quantity: 1 },
    ]);
  });
});
