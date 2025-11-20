# Repository Audit: next-supa-file-ai

This document summarizes what is currently implemented in the `next-supa-file-ai` repository and where it diverges from the original plan (Next.js + Supabase + Google ADK + CopilotKit/ag-ui powered intelligent file system manager).

## 1. What is implemented today

### 1.1 Core application stack
- **Framework**: Next.js 15 with React 19 and App Router as documented in the root README and package.json.
- **Auth/DB/Storage**: Supabase client libs (`@supabase/supabase-js`, `@supabase/ssr`) are present along with README references to pgvector-based knowledge base and Supabase Storage.
- **File ingestion pipeline**: Dependencies such as `mammoth`, `pdf-parse`, `xlsx`, `file-type`, and `react-dropzone` indicate support for DOCX, PDF, XLSX parsing plus drag-and-drop uploads.
- **AI/LLM stack**: Uses Vercel AI SDK (`ai`) together with Google Gemini SDKs (`@ai-sdk/google`, `@google/generative-ai`) to analyze uploaded content.
- **Queues/background jobs**: `bullmq` and `ioredis` suggest asynchronous processing for heavy ingestion tasks; README highlights multi-phase pipeline (upload → analysis → embeddings → knowledge base).
- **Integrations**: MCP SDK (`@modelcontextprotocol/sdk`) plus `@notionhq/client` and `googleapis` provide building blocks for the Google/Notion/Jira connectors mentioned in the README.

### 1.2 UI/UX stack
- Radix UI primitives, shadcn-style components, Tailwind CSS, Zustand, TanStack Query, and React Hook Form power the client experience described in the README (drag/drop uploads, chat interface, knowledge base screens).

## 2. What is missing relative to the ADK + CopilotKit vision

| Requirement from original plan | Evidence in repo | Status |
| --- | --- | --- |
| Google Agent Development Kit (ADK) for tool-enabled agents | No `@google-cloud/agentkit`, `@google/generativeai/agents`, or ADK configs anywhere (`rg "ADK"` returns nothing) | **Missing** |
| CopilotKit / ag-ui based agent UI | No `@copilotkit/...` or `ag-ui` packages in `package.json`; README never mentions CopilotKit | **Missing** |
| Explicit agent/tool orchestration | README outlines “AI agent factory” conceptually, but there are no tool definitions, memory stores, or agent runtimes tied to ADK/CopilotKit | **Not implemented** |
| Long-running agent workflows & memory | Present stack centers on synchronous LLM calls + BullMQ jobs; no ADK memory stores or orchestration logic observed | **Not implemented** |

In short, the repo implements a custom file-analysis pipeline (upload → parse → Gemini → Supabase knowledge base) rather than the multi-agent, tool-calling architecture planned with ADK + CopilotKit.

## 3. Recommended next steps to realign

1. **Introduce Google ADK**
   - Add ADK packages and define tool schemas for file ingestion, Supabase queries, external connectors, etc.
   - Implement agent orchestration (task routing, tool selection, state/memory persistence) leveraging Supabase or Redis for memory storage.

2. **Integrate CopilotKit/ag-ui**
   - Swap or augment the current chat UI with CopilotKit components so users can observe agent reasoning, tool invocations, and intermediate steps.
   - Wire CopilotKit’s client runtime to the new ADK-powered agents.

3. **Document end-to-end agent pipeline**
   - Extend architecture docs to describe how uploads transition into agent-managed tasks, where memory lives, and how MCP connectors are surfaced as tools.
   - Clarify how BullMQ workers (or Supabase Edge Functions) will trigger ADK agents for large jobs.

4. **Hardening & validation**
   - Add automated tests for ingestion strategies, queue workers, and soon-to-be-added agent workflows.
   - Ensure environment variable templates include ADK + CopilotKit requirements.

This audit should help you decide whether to enhance the current baseline with ADK/CopilotKit or re-architect from scratch.
