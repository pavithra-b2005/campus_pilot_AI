# CampusPilot AI

> **"Your campus. Your goals. Your copilot."**

CampusPilot AI is an autonomous academic productivity agent built for university students. Unlike conventional chatbots that hallucinate unverified text responses, CampusPilot implements a strict **Approval-Based Human-In-The-Loop (HITL) Agent Architecture** with real application tool functions.

---

## 🌟 Key Features

1. **Autonomous Planning Engine**: Analyzes natural language prompts (e.g., *"I have a Java exam in 3 days, a Software Engineering assignment due tomorrow, and 3 hours today"*), extracts deadlines, and computes priority weightings.
2. **Approval-Based Human-in-the-Loop Gate**: Proposes structured tool operations (`createTasks()`, `updateTask()`, `deleteTask()`, `generateStudyPlan()`). No changes are made to user data until the student clicks **"Approve Plan & Execute Tools"**.
3. **Real Tool Execution & Audit Receipts**: Directly executes real application functions to mutate persistent storage and returns an immutable execution receipt with item counts, timestamps, and audit logs.
4. **Persistent Task Manager**: Full CRUD management with priorities (High, Medium, Low), courses, categories, due dates, filters, search, and local persistence.
5. **Smart Study Planner**: Computes high-yield Pomodoro blocks, detects delayed/overdue tasks with adaptive rescheduling, and features an active focus timer.
6. **Dual Engine Support**: Powered by Google Gemini 3.8 Flash via the `@google/genai` TypeScript SDK on the server side, with a built-in local demonstration fallback engine for offline or zero-configuration testing.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend / Server**: Node.js, Express, tsx
- **AI Integration**: `@google/genai` SDK (`gemini-3.8-flash`) with server-side proxy
- **Build System**: Vite 8

---


## 🏗️ Architecture & Workflow

```
Student Natural Language Input
            ↓
  Gemini 3.8 Flash Engine (Intent & Commitment Recognition)
            ↓
  Structured Proposed Action Schema (createTasks, updateTask, etc.)
            ↓
  [Human-in-the-Loop Gate]  ← Student Reviews, Approves, or Cancels
            ↓
  Real Application Tool Execution (listTasks, createTasks, saveActivePlan)
            ↓
  Database Persistence & Verifiable Execution Receipt
```

---

## 📄 License

Apache-2.0
