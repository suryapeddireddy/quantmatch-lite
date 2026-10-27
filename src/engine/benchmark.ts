import { performance } from "node:perf_hooks";
import { MatchingEngine, type OrderRequest } from "./matchingEngine";

const defaultOrderCount = 100_000;
const minimumOrderCount = 10_000;
const benchmarkSeed = 0xc0ffee;

function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function createOrders(count: number, seed: number): OrderRequest[] {
  const random = createRandom(seed);
  const orders: OrderRequest[] = [];

  for (let index = 0; index < count; index += 1) {
    const side = random() < 0.5 ? "buy" : "sell";
    const quantity = Number((0.1 + random() * 1.9).toFixed(4));
    const id = `benchmark-${index}`;

    if (random() < 0.75) {
      orders.push({
        id,
        side,
        type: "limit",
        price: 99 + Math.floor(random() * 201) / 100,
        quantity,
      });
    } else {
      orders.push({ id, side, type: "market", quantity });
    }
  }

  return orders;
}

function main(): void {
  const orderCount = Number(process.argv[2] ?? defaultOrderCount);
  if (!Number.isSafeInteger(orderCount) || orderCount < minimumOrderCount) {
    throw new RangeError(`Order count must be an integer of at least ${minimumOrderCount}.`);
  }

  const orders = createOrders(orderCount, benchmarkSeed);
  const warmupOrderCount = Math.min(10_000, orderCount);
  const warmupEngine = new MatchingEngine();
  for (let index = 0; index < warmupOrderCount; index += 1) {
    warmupEngine.submitOrder(orders[index]);
  }

  const engine = new MatchingEngine();
  let tradeCount = 0;

  const startedAt = performance.now();
  for (const order of orders) {
    tradeCount += engine.submitOrder(order).length;
  }
  const elapsedMilliseconds = performance.now() - startedAt;

  const elapsedSeconds = elapsedMilliseconds / 1_000;
  const throughput = orderCount / elapsedSeconds;
  const averageLatencyMicroseconds = (elapsedMilliseconds * 1_000) / orderCount;
  const book = engine.getOrderBook();

  console.log("QuantMatch-Lite matching engine benchmark");
  console.log(`Orders processed: ${orderCount.toLocaleString("en-US")}`);
  console.log(`Warm-up orders: ${warmupOrderCount.toLocaleString("en-US")}`);
  console.log(`Seed: 0x${benchmarkSeed.toString(16)}`);
  console.log(`Elapsed: ${elapsedMilliseconds.toFixed(2)} ms`);
  console.log(`Throughput: ${throughput.toFixed(0)} orders/second`);
  console.log(`Average execution latency: ${averageLatencyMicroseconds.toFixed(2)} µs/order`);
  console.log(`Trades executed: ${tradeCount.toLocaleString("en-US")}`);
  console.log(`Resting price levels: ${book.bids.length + book.asks.length}`);
}

main();
