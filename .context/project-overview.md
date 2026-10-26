# QuantMatch-Lite Overview

## Overview
QuantMatch-Lite is a high-performance, deterministic, single-threaded Limit Order Book (LOB) matching engine and real-time visualization dashboard. It bridges rigorous algorithmic data structures ($O(1)$ order management) with financial market microstructure.

## Goals
1. Implement a bulletproof matching engine adhering strictly to price-time priority.
2. Provide a real-time Level 2 market depth and order book visualization interface.
3. Support Limit and Market order submissions (Buy/Sell) with zero race conditions.
4. Deliver portfolio-grade code quality demonstrating systems engineering capabilities for Master's and Quant roles.

## Core Features
- **Deterministic Matching Engine**: Core matching logic executing in pure TypeScript with strict price-time priority rules.
- **Level 2 Order Book**: Real-time aggregation of bids and asks by price level.
- **Order Management Form**: Instant execution for Market orders and resting liquidity for Limit orders.
- **Live Trade Ticker**: Chronological feed of executed trades, matching quantities, and execution prices.