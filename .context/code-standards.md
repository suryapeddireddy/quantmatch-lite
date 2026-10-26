# Code Standards

## General
- Keep modules small and single-purpose. Separate pure calculation/engine code from UI presentation entirely.
- Strict TypeScript rules: no `any` types; all order types, trade interfaces, and map structures must be fully typed.

## Matching Engine Rules
- Use efficient data structures (e.g., Maps for price levels and arrays/queues for orders at each price level).
- Ensure price level entries are automatically pruned when quantity drops to zero to prevent memory leaks.