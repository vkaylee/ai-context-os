# ai-context-os: The AI-Native Operating System for Software Projects

> **"Don't generate code. Orchestrate it."**

## 🎯 Purpose

`ai-context-os` is an **installable LLM Orchestrator Framework** designed to manage the intelligence, constraints, and context of AI Agents (Cursor, Claude, Antigravity) within any repository. It treats "AI Context" as **Infrastructure-as-Code**.

This OS uses a **Fallback Architecture (Inheritance)**. Users can define their own project-specific skills and protocols, but if none exist, the AI automatically falls back to the robust, standardized `ai-context-os` core.

### Problem Solved
1.  **Eliminates Overlap**: Prevents conflicting AI skills.
2.  **Enforces SSOT**: Ensures all agents follow `PROJECT_OS.md`.
3.  **Standardizes Interaction**: Creates a unified protocol for AI-to-System communication.
4.  **Graceful Fallback**: Custom rules always win, but a safe standard is always there.

---

## 🧩 How it Works: The "Pointer Architecture"

The biggest challenge in AI projects is **Context Pollution** (when the AI reads too many conflicting rule files). `ai-context-os` solves this by hiding the heavy logic inside a `.ai-context-os/` directory and placing small "Pointer" files in your project root.

1. **The Kernel**: All your project's rules live in `.ai-context-os/PROJECT_OS.md`.
2. **The Pointers**: Files like `.cursorrules` or `CLAUDE.md` in your root don't contain rules themselves; they tell the AI: *"Stop! Don't look here. Go read `.ai-context-os/PROJECT_OS.md` instead."*
3. **The Result**: Your project root stays clean, and the AI only ever has **one source of truth**.

---

## 🏛️ Core Concepts (The Layers)

We organize intelligence into four distinct layers:

| Layer | Name | Description |
| :--- | :--- | :--- |
| **L0** | **Kernel** | The immutable "Constitution" of your project (`PROJECT_OS.md`). |
| **L1** | **Adapters** | Pointer files (`.cursorrules`, `CLAUDE.md`) that bridge the AI to the Kernel. |
| **L2** | **Skills** | Modular specialized knowledge (e.g., "How we write React code" or "TDD Rules"). |
| **L3** | **Docs** | Evidence and history (ADRs, Decision logs, and Walkthroughs). |

---

## 📂 Architecture

```text
├── PROJECT_OS.md       # L0: The Kernel (Single Source of Truth)
├── CLAUDE.md           # L1: Adapter for Claude/Antigravity
├── .cursorrules        # L1: Adapter for Cursor AI
├── .agent/             # L1: Adapter for Generic Agents
├── skills/             # L2: Modular Capabilities (React, Rust, etc.)
└── docs/               # L3: Human-Readable Context
```

## 🚀 Getting Started

Most projects you work on will already exist. Therefore, the best way to leverage `ai-context-os` is to integrate its core files into your existing repository rather than forking.

### Option 1: Automated Install (Pointer Pattern - Recommended)
You can use the provided install script to automatically copy the core files into a hidden `.ai-context-os/` folder in your project and create pointer files in the root:

| Command | Action | Example |
| :--- | :--- | :--- |
| `npx ai-context-os .` | Quick Integration (Current Dir) | `npx ai-context-os .` |
| `npx ai-context-os audit` | Check Architectural Compliance | `npx ai-context-os audit` |
| `npx ai-context-os -v` | Show Current version | `npx ai-context-os -v` |

*Why this is better:* Keeps your project root clean. You will only see `.cursorrules` and `CLAUDE.md` in your root which act as pointers to the true OS rules inside `.ai-context-os/`.

### Option 2: Manual Install
1.  **Create OS Folder**: `mkdir .ai-context-os` in your project root.
2.  **Integrate Core Files**: Copy `PROJECT_OS.md`, `.cursorrules`, `CLAUDE.md`, and the `skills` folder into `.ai-context-os/`.
3.  **Boot the AI via Pointers**: Create a `.cursorrules` or `CLAUDE.md` file in the root of your existing project mapping to the files in `.ai-context-os/`.

## 📜 Core Protocols

- **Protocol-First**: Rules in `PROJECT_OS.md` override any AI training.
- **Context Hygiene**: Always scout before implementing.
- **Modularity**: Files < 200 lines. Docker for execution.
- **Atomic Documentation**: Every code change MUST include simultaneous documentation updates.
- **Regression Assurance**: Full test suites must be rerun after every modification.

---

## 🔄 Common Workflows

### 1. Fresh Integration
To add the OS to a new project (Automatic mode):
```bash
npx ai-context-os .
```
*(Optionally use `npx ai-context-os install .` if you prefer explicit subcommands)*

### 2. Checking Compliance
To verify if your project still adheres to the rules:
```bash
npx ai-context-os audit --diamond
```

### 3. Adding a New "Skill"
If you want to teach the AI a new standard (e.g., "Always use Tailwind"):
1. Create a new file: `.ai-context-os/skills/my-new-skill.md`.
2. Mention it in `PROJECT_OS.md`.
3. The AI will now automatically follow it as a fallback!

---

## 🤝 Contributing

We welcome PRs that improve the OS kernel or add new L1 adapters.
