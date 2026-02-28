PRD.md

---

# ShowMiro: Exhaustive Product Requirement Document (v1.0)

## 1. Executive Summary & Strategy

* **Product Name**: ShowMiro
* **Mission**: Build a "system of record" for AI visual creation by turning prompts into reusable, versioned templates.
* 
**Geography**: India-first, then global English markets.


Mission: To transform ephemeral, "one-off" AI prompts into durable, professional-grade creative assets.
+1


Problem Statement: Creators lose 3–5 hours weekly to "Prompt Drift"—the inability to replicate specific visual styles due to scattered notes, inconsistent model settings, and lost version history.
+1

Target Audience:


Primary: Freelance Visual Designers requiring fast, consistent client deliverables.
+1

Secondary: Marketing Teams needing brand-standardized prompt libraries.


Tertiary: E-commerce Managers scaling product image variants.

Core Differentiator: Unlike a simple gallery, ShowMiro is a Personal Workspace first; discovery is the fuel, but the private library is the engine.




* **Success Metric**: High **Reuse Rate** (percentage of generations from saved templates) and **Day 7 Retention**.

## 2. Technical Stack & Infrastructure

* **Frontend**: Next.js 14 (App Router) with TypeScript and Tailwind CSS.
* **Backend**: Node.js services with Zod for strict validation.
* **Database**: Supabase (PostgreSQL) with Real-Time Subscriptions.
* **Inference**: Provider APIs (Midjourney/DALL-E) via an asynchronous **Job Queue Pattern**.

## 3. Data Architecture (The Foundation)

The system follows a **Workspace-based multi-tenancy model**.

### 3.1 Core Database Schema

| Table | Primary Fields | RLS / Security Intent |
| --- | --- | --- |
| `profiles` | `id`, `user_id`, `email`, `workspace_id` | User can only read/update their own profile. |
| `workspaces` | `id`, `owner_id`, `name` | Private; only the owner/members can access. |
| `memberships` | `profile_id`, `workspace_id`, `role` | Links users to workspaces; defines access. |
| `prompt_templates` | `id`, `workspace_id`, `current_version_id` | Private to the workspace members. |
| `prompt_versions` | `id`, `template_id`, `prompt_text`, `settings` | **Immutable**; inherits workspace RLS. |
| `generation_jobs` | `id`, `user_id`, `status`, `payload`, `retry` | Only the job creator can view status/results. |
| `public_posts` | `id`, `version_id`, `attribution` | **Public Read**; Admin-only write. |

## 4. Key Security & "Cyber Thinking" Rules

* **Row-Level Security (RLS)**: Mandatory for every table containing user data.
* **No Client-Side Keys**: Provider API keys (OpenAI, etc.) are **Server-Only**; use environment variables.
* **Signed URLs**: All generated assets in Supabase Storage must be accessed via signed, time-limited URLs.

## 5. Functional Requirements (P0)

1. **Auth & Provisioning**: Supabase Auth + auto-creation of a default private workspace on first login.
2. **Prompt Library**: Searchable, tagged repository of private templates.
3. **Templating Engine**: Structured JSON templates with `{{variable}}` substitution.
4. **Version Control**: Support for immutable history, forking, and rolling back.
5. **Generation Runner**: Async jobs with status tracking (queued, running, success, fail).
6. **One-Click Import**: Save public discovery prompts into private workspaces with attribution.

## 6. Milestones & Release Plan

| Milestone | Objective | Exit Criteria (Definition of Done) |
| --- | --- | --- |
| **M1: Foundation** | Env & DB Setup | `schema.sql` applied; RLS verified via Agent scripts. |
| **M2: Identity** | Auth Loop | User logs in and lands on private "My Library". |
| **M3: CRUD Core** | Asset Mgmt | Create/Version/Search prompts works in workspace isolation. |
| **M4: The Remix** | AI Workflow | Remix function returns valid structured JSON prompt bundles. |
| **M5: Launch** | Production | Netlify deploy; Browser Subagent passes E2E test recording. |

## 7. Operational Guardrails for Antigravity Agent

* **Reasoning**: Use **Gemini 3.1 Pro (High)** for architectural changes.
* **Strict Mode**: Explicit user approval required for all terminal/JS execution.
* **Verification**: The **Browser Subagent** MUST verify UI flows and provide **Screen Recording Artifacts**.
* **Out of Scope**: No Figma plugin or Enterprise SSO in MVP.

---
