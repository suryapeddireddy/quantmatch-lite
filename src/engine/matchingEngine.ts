export type OrderSide = "buy" | "sell";

export interface LimitOrder {
  id: string;
  side: OrderSide;
  type: "limit";
  price: number;
  quantity: number;
}

export interface MarketOrder {
  id: string;
  side: OrderSide;
  type: "market";
  quantity: number;
}

export type OrderRequest = LimitOrder | MarketOrder;

export interface Trade {
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
}

export interface BookLevel {
  price: number;
  quantity: number;
}

export interface OrderBookSnapshot {
  bids: BookLevel[];
  asks: BookLevel[];
}

interface RestingOrder {
  id: string;
  side: OrderSide;
  quantity: number;
}

interface OrderNode {
  order: RestingOrder;
  next: OrderNode | null;
}

class PriceLevel {
  private head: OrderNode | null = null;
  private tail: OrderNode | null = null;
  private totalQuantity = 0;

  add(order: RestingOrder): void {
    const node: OrderNode = { order, next: null };
    if (this.tail) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.totalQuantity += order.quantity;
  }

  first(): RestingOrder | undefined {
    return this.head?.order;
  }

  consume(quantity: number): void {
    const head = this.head;
    if (!head || quantity > head.order.quantity) {
      throw new Error("Cannot consume more than the first order's remaining quantity.");
    }

    const order = head.order;
    order.quantity -= quantity;
    this.totalQuantity -= quantity;

    if (order.quantity === 0) {
      this.head = head.next;
      if (!this.head) {
        this.tail = null;
      }
    }
  }

  isEmpty(): boolean {
    return this.head === null;
  }

  snapshot(price: number): BookLevel {
    return { price, quantity: this.totalQuantity };
  }
}

interface IncomingOrder {
  id: string;
  side: OrderSide;
  remainingQuantity: number;
  limitPrice?: number;
}

export class MatchingEngine {
  private readonly bids = new Map<number, PriceLevel>();
  private readonly asks = new Map<number, PriceLevel>();

  submitOrder(order: OrderRequest): Trade[] {
    this.validateOrder(order);

    const incoming: IncomingOrder = {
      id: order.id,
      side: order.side,
      remainingQuantity: order.quantity,
      ...(order.type === "limit" ? { limitPrice: order.price } : {}),
    };
    const trades = this.match(incoming);

    if (order.type === "limit" && incoming.remainingQuantity > 0) {
      const book = order.side === "buy" ? this.bids : this.asks;
      let level = book.get(order.price);
      if (!level) {
        level = new PriceLevel();
        book.set(order.price, level);
      }
      level.add({
        id: order.id,
        side: order.side,
        quantity: incoming.remainingQuantity,
      });
    }

    return trades;
  }

  getOrderBook(): OrderBookSnapshot {
    return {
      bids: this.snapshotBook(this.bids, (a, b) => b - a),
      asks: this.snapshotBook(this.asks, (a, b) => a - b),
    };
  }

  private match(incoming: IncomingOrder): Trade[] {
    const oppositeBook = incoming.side === "buy" ? this.asks : this.bids;
    const priceComparator = incoming.side === "buy"
      ? (a: number, b: number) => a - b
      : (a: number, b: number) => b - a;
    const prices = [...oppositeBook.keys()].sort(priceComparator);
    const trades: Trade[] = [];

    for (const price of prices) {
      if (this.priceDoesNotCross(incoming, price)) {
        break;
      }

      const level = oppositeBook.get(price);
      if (!level) {
        continue;
      }

      while (incoming.remainingQuantity > 0) {
        const restingOrder = level.first();
        if (!restingOrder) {
          break;
        }

        const fillQuantity = Math.min(incoming.remainingQuantity, restingOrder.quantity);
        incoming.remainingQuantity -= fillQuantity;
        level.consume(fillQuantity);
        trades.push({
          buyOrderId: incoming.side === "buy" ? incoming.id : restingOrder.id,
          sellOrderId: incoming.side === "sell" ? incoming.id : restingOrder.id,
          price,
          quantity: fillQuantity,
        });
      }

      if (level.isEmpty()) {
        oppositeBook.delete(price);
      }

      if (incoming.remainingQuantity === 0) {
        break;
      }
    }

    return trades;
  }

  private priceDoesNotCross(incoming: IncomingOrder, restingPrice: number): boolean {
    if (incoming.limitPrice === undefined) {
      return false;
    }
    return incoming.side === "buy"
      ? restingPrice > incoming.limitPrice
      : restingPrice < incoming.limitPrice;
  }

  private snapshotBook(
    book: Map<number, PriceLevel>,
    comparator: (a: number, b: number) => number,
  ): BookLevel[] {
    return [...book.entries()]
      .sort(([priceA], [priceB]) => comparator(priceA, priceB))
      .map(([price, level]) => level.snapshot(price));
  }

  private validateOrder(order: OrderRequest): void {
    if (order.id.trim().length === 0) {
      throw new TypeError("Order id must not be empty.");
    }
    if (!Number.isFinite(order.quantity) || order.quantity <= 0) {
      throw new RangeError("Order quantity must be a finite positive number.");
    }
    if (order.type === "limit" && (!Number.isFinite(order.price) || order.price <= 0)) {
      throw new RangeError("Limit order price must be a finite positive number.");
    }
  }
}
