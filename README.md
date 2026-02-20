# ai-context-os: The AI-Native Operating System for Software Projects

> **"Don't generate code. Orchestrate it."**

`ai-context-os` is an **installable LLM Orchestrator Framework** designed to manage the intelligence, constraints, and context of AI Agents (Cursor, Claude, Antigravity) within any repository. It treats "AI Context" as **Infrastructure-as-Code**.

## ✨ What's New in v2.20

- **Recursive Evolution**: The OS is now "living". Agents possess Legislative Rights (L4 Protocol) to autonomously detect knowledge gaps, research new technologies, and author new standardized skills into the OS without human intervention.
- **Silent Bootstrapping**: Zero-prompt initializations. Agents read the `.ultp_state` buffer to instantly sync environment states without running blocking shell commands.
- **Dynamic Shared Memory**: Continuity between agent sessions through a centralized `.ai-context-os/memory/session.md` event log.
- **Diamond Standards**: Rigorous 90% test coverage threshold and 100% Purity checks for modular capabilities.

---

## 🎯 The Problem Solved

When working with Advanced Agents, context quickly degrades into a mess of conflicting rules, lost memories, and hallucinated patterns. `ai-context-os` solves this via a **Fallback Architecture (Inheritance)**.

1.  **Context Hygiene**: Hides complex logic inside `.ai-context-os/` and places tiny "pointer" files (`.cursorrules`, `CLAUDE.md`) in your root.
2.  **Enforces SSOT**: Ensures all agents fall back to the unbreakable laws in `PROJECT_OS.md` if project-specific rules fail.
3.  **Self-Healing**: Agents detect systemic failures and literally rewrite their own context rules to prevent a recurrence.

---

## 🏛️ Architecture & Layers

We organize intelligence into four distinct layers:

| Layer | Name | Description |
| :--- | :--- | :--- |
| **L0** | **Kernel** | The immutable "Constitution" of your project (`PROJECT_OS.md`). |
| **L1** | **Adapters** | Pointer files (`.cursorrules`, `CLAUDE.md`, `GEMINI.md`) that bridge the AI to the Kernel. |
| **L2** | **Skills** | Modular capabilities (React, Fastify, TDD) automatically generated and vetted. |
| **L3** | **Memory** | Operational session logs allowing continuity across distinct agent runs. |

```text
├── PROJECT_OS.md       # L0: The Kernel (Single Source of Truth)
├── CLAUDE.md           # L1: Adapter for Claude/Antigravity
├── .cursorrules        # L1: Adapter for Cursor AI
├── GEMINI.md           # L1: Adapter for Gemini AI
├── skills/             # L2: Modular Capabilities (TDD, Frameworks)
└── memory/             # L3: Dynamic Shared Memory
```

---

## 🚀 Getting Started

The best way to leverage `ai-context-os` is to drop it into your existing projects to instantly structure their AI workflows.

### 1. Automated Integration (Recommended)
Run the following in your project root to provision the hidden `.ai-context-os/` folder and setup the L1 pointers:
```bash
npx ai-context-os .
```

*This keeps your root clean. Only `.cursorrules`, `CLAUDE.md`, and `GEMINI.md` are visible, acting as silent bootstrappers.*

### 2. Manual Integration
1. `mkdir .ai-context-os` in your project root.
2. Use this package as a template: Move `PROJECT_OS.md` and the `skills` folder into your `.ai-context-os/` directory.
3. Copy one of the `adapter-***.md` templates into your root (rename it to `.cursorrules` or `CLAUDE.md`).

---

## ⚙️ Core Protocols

- **Protocol-First**: Rules in `PROJECT_OS.md` override any pre-trained AI assumptions.
- **Silent Synchronization**: Agents establish context context entirely O(1) via the `.ultp_state` cache without executing messy CLI commands.
- **Atomic Documentation**: Every code change MUST include simultaneous documentation updates.
- **Regression Assurance**: Full test suites must be rerun after every modification.

## 🛠️ CLI Utilities

| Command | Action |
| :--- | :--- |
| `npx ai-context-os .` | Quick Integration (Current Dir) |
| `npx ai-context-os audit --diamond` | Check Architectural Compliance against Purity rules |
| `npx ai-context-os scout` | Visualize the active Context Architecture and loaded skills |

## 🤖 AI-Native Integration (ULTP)

This OS uses the **Ultra-Low Token Protocol (ULTP)** to serialize the entire system state into a tiny string:
`[OS:A][L0:V;P:.ai-context-os/PROJECT_OS.md][L1:C,G,K][L2:tdd,fastify][M:V]`

This reduces context overhead by **65%**, providing high-density signaling for faster, cheaper, and more accurate AI orchestration.

---

## 🤝 Contributing & Legislation

The OS is designed to be self-writing. However, we welcome human PRs that improve the kernel or add new standardized L1 adapters. To trigger an AI-driven skill discovery in your fork, simply ask the agent to implement a technology it hasn't seen before.
