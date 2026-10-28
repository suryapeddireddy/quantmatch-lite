# QuantMatch-Lite

> A high-performance, deterministic Limit Order Book (LOB) matching engine and real-time visualization dashboard built for quantitative finance and systems engineering portfolios.

---

## 🚀 Overview

**QuantMatch-Lite** bridges rigorous algorithmic data structures ($O(1)$ order management) with financial market microstructure. It features a decoupled, pure TypeScript matching engine enforcing strict **price-time priority** and a real-time Level 2 visualization dashboard built with Next.js and Tailwind CSS.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS (Dark Financial Terminal Theme)
- **Icons**: Lucide React
- **Charting**: Recharts (Cumulative Depth Chart)
- **Core Engine**: Pure TypeScript (Zero-dependency, decoupled state machine)

---

## 📂 Project Architecture

```text
quantmatch-lite/
├── context/                # Spec-driven agentic context & guidelines
├── src/
│   ├── engine/             # Core LOB matching engine, data structures, & benchmarks
│   ├── components/         # Modular UI (OrderBook, OrderForm, DepthChart, TradeTicker)
│   └── app/                # Next.js App Router layout and dashboard page
├── AGENTS.md               # Agentic rules and workflow configuration
└── README.md