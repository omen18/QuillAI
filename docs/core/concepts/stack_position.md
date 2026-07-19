---
sidebar_label: Where does Quill sit in my stack?
---

# Where does Quill sit in my stack?

> Quill does not replace your warehouse, your transformation pipeline, or your existing semantic layer. It sits **between** your data infrastructure and the agents querying it, providing the context they need to generate and deploy trustworthy BI safely.

## The short version

```text
┌──────────────────────────────────────────────────────┐
│   Your AI agents (Claude Code, Cursor, custom apps)  │
└────────────────────────┬─────────────────────────────┘
                         │  ask questions, get context
                         ▼
┌──────────────────────────────────────────────────────┐
│              Quill - open context layer            │
│   MDL · Memory · Skills · Governed execution         │
└────────────────────────┬─────────────────────────────┘
                         │  planned, governed SQL
                         ▼
┌──────────────────────────────────────────────────────┐
│   Your warehouse, transformation pipeline, files     │
│   (PostgreSQL, BigQuery, Snowflake, DuckDB, ...)     │
└──────────────────────────────────────────────────────┘
```

Above Quill sit the **agents** that ask questions. Below it sits the **data infrastructure** that stores the answers. Quill is the layer in between that turns "I can see schema" into "I know what the business means."

## What it does NOT replace

**Your data warehouse.** Quill does not store rows. Your warehouse keeps storing rows. Quill sends planned SQL there for execution.

**Your transformation pipeline.** If you already model raw data into clean tables (dbt, custom Python, scheduled SQL), keep doing that. Quill reads the result, it does not own the upstream pipeline.

**Your existing semantic layer.** If you already have business-facing models, metrics, or a metric layer, Quill can layer on top to give agents the same definitions without rebuilding them. The MDL you author is the **agent-facing contract**; what you already have stays where it lives.

**Your BI or dashboard tool.** Quill is built for autonomous consumers (agents, scripts, embedded apps). Dashboards keep using whatever you already use.

## What it does provide

**The agent-facing context layer.** The five layers (structural, semantic, business, operational, behavioral) collected into one inspectable, version-controlled surface that any agent can query.

**A governed SQL plane.** The CLI plans modeled SQL into executable SQL, runs dry-plan / dry-run, applies access policies, and executes through your warehouse connectors. The agent does not need direct database credentials or unrestricted access.

**An agent-native interface.** Skills, an SDK for popular agent frameworks, and a CLI built to be driven by an LLM-based coding agent. None of it requires a new UI to maintain.

## Where Quill fits depending on what you already have

### You have no semantic layer

Start with Quill's context layer. The `generate-mdl` guide scaffolds an MDL project from your warehouse schema in a few minutes — your first set of trusted semantic definitions, with the rest of the context layer (`knowledge/rules/`, memory, governance) growing around them. Enrich it over time with the grill / auto-pilot workflow.

### You have a transformation pipeline (dbt, Coalesce, in-house)

Keep it. Point Quill at the **output tables** of your pipeline. The MDL describes the agent-facing meaning of those tables: what columns to expose, which joins are approved, which calculations are reusable. The pipeline keeps owning ingestion and modeling logic. Quill owns the layer between modeled data and the agent.

### You have a semantic layer

Quill does not compete with it for the data team. Its context layer gives the **agents** the same definitions through a structure agents can read and reason about: MDL files, structured retrieval, memory of past answers, governed execution primitives. Think of it as the agent-native projection of the semantic layer you already use.

### You have multiple warehouses

Profiles separate connection credentials from project definitions. The same MDL project can be bound to dev / staging / prod profiles. The MDL stays portable; the profile carries the credentials.

## Where Quill does not fit

- **You only need a chat-driven BI app.** Quill is a primitive layer, not a chat UI. If you want a turnkey conversational dashboard, the commercial Quill product or another vendor will be a better fit.
- **You want zero schema modeling.** Even the scaffold step asks for some review. If "auto-magic with no review" is the requirement, no context layer will be honest with you.
- **You query mostly unstructured text.** Quill focuses on structured business data. RAG over docs is a separate problem.

## Why "layered, not replacing"

Replacing your stack to get an AI agent that queries it well is a fast way to make nobody happy. The pattern Quill was designed around is the inverse: **leave the existing stack in place, add one inspectable layer on top, give every agent the same governed surface**.

That is also why Quill is open source. Business context is too important to lock inside a vendor product. Your MDL, examples, query history, and mapping decisions should live in your repo, under your team's review.

## See also

- [What does Quill mean by context?](./what_is_context.md): the conceptual ground
- [Architecture](/oss/reference/architecture): the technical stack inside Quill
- [Connect your data](/oss/guides/connect): point Quill at your warehouse
- [Manage project](/oss/guides/manage_project): multi-environment profile workflow
