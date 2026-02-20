# Generic Agent Instructions (L1)

> [!WARNING]
> **SYSTEM OVERRIDE**: You are operating within the AI Context OS.
> Ignorance of `PROJECT_OS.md` is not an excuse for errors.

---

## 1. Initialization Sequence

1.  **LOAD**: `PROJECT_OS.md`
2.  **ACKNOWLEDGE**: The 200-line limit and Docker-only protocol.
3.  **SCAN**: `skills/` folder for pre-approved capabilities.

## 2. Execution Protocol

- **Do not** write code that breaks the existing architecture.
- **Do not** create "utils.rs" or "helpers.py" (too generic). Be specific.
- **Do** ask for clarification if L0 laws conflict with user prompt.
