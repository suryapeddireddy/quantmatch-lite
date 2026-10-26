# Development Workflow

## Approach
Build incrementally using spec-driven tasks. Always consult context files before generating code or modifying data structures.

## Scoping Rules
- Work on one subsystem at a time (e.g., Engine Logic $\rightarrow$ UI Table $\rightarrow$ Order Form $\rightarrow$ Trade Ticker).
- Do not mix engine matching logic updates and UI layout changes in a single commit step.