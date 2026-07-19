<div align="center" id="top">
<a href="https://github.com/omen18/QuillAI">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./misc/quill_logo_white.png">
    <img src="./misc/quill_logo.png" width="300px" alt="Quill">
  </picture>
</a>

### Quill — Open-source GenBI: generative BI for AI agents.

*Your agents generate, deploy, and govern dashboards from any database, grounded in a context layer they can actually trust.*

[Docs](https://github.com/omen18/QuillAI/tree/main/docs) · [Discord](https://discord.gg/5DvshJqG8Z) · [Vision](https://github.com/omen18/QuillAI) · [Blog](https://github.com/omen18/QuillAI)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/omen18/QuillAI?logo=github&label=release)](https://github.com/omen18/QuillAI/releases)
[![Last commit](https://img.shields.io/github/last-commit/omen18/QuillAI)](https://github.com/omen18/QuillAI/commits/main)
[![Made by Yash Raj Sharan](https://img.shields.io/badge/made_by-Yash_Raj_Sharan-blue)](https://github.com/omen18)
![Stars](https://img.shields.io/github/stars/omen18/QuillAI?style=social)



</div>

> 📣 **2026-05-07**: Quill Engine has merged into this repo under [`core/`](./core). The previous `omen18/quillai-engine` repo is archived. The previous Quill GenBI app (the Docker-based chat-first BI product) is preserved on the [`legacy/v1`](https://github.com/omen18/QuillAI/tree/legacy/v1) branch (tag `v1-final`) and is now **Quill GenBI Classic**; see [A note on the "GenBI" name](#a-note-on-the-genbi-name) below. [Read the announcement →](https://github.com/omen18/QuillAI/discussions)

<!--
  📺 HERO DEMO (place here)
  ─────────────────────────
  Suggested: a 10-second silent loop showing GenBI end to end:
    1. User asks their agent (in plain language) for a dashboard
    2. Agent writes governed SQL via the Quill context layer, builds the app
    3. `quill genbi deploy` produces a live, shareable dashboard URL
  Format: .gif (≤2 MB) or .mp4 (autoplay-muted).
  Save under  /assets/quill-demo.gif  and use the line below:

  <img src="./assets/quill-demo.gif" alt="Quill GenBI in action" width="820" />
-->

---

## What Quill is

Quill is the **open-source GenBI engine**: it lets AI agents **generate, deploy, and govern** business intelligence, from a SQL answer to a shareable dashboard, across 22+ data sources.

What makes the output trustworthy is the layer underneath: an open **context layer** that gives agents what schemas don't. That means business semantics, approved definitions, examples, memory, and governance, plus the unstructured company knowledge that lives in your docs, wikis, and chat threads. Generative BI is only as good as the context it stands on, and Quill is that context, made reviewable and reusable by every agent you already run.

![Quill architecture](./misc/quill-architecture.png)

## GenBI in three beats: Generate · Deploy · Know

- **Generate.** Your agent turns a business question into *governed* SQL and charts. Schema-aware retrieval, MDL planning, dry-plan validation, and structured errors keep it correct instead of confidently wrong.
- **Deploy.** Turn any answer into a shareable, browser-side dashboard powered by [`quill-core-wasm`](https://github.com/omen18/QuillAI/tree/main/core/quill-core-wasm) and ship it to your own Vercel or Cloudflare Pages account with one command.
- **Know.** The knowledge that makes all of this correct lives in versionable, evidence-linked files: semantic models (MDL), company definitions (`instructions.md`), and a memory of what worked. Reviewable. Git-friendly. Never locked inside someone else's UI.

## Why agent builders pick Quill

- **Generative BI, end to end.** Not just text-to-SQL. Generate the answer, deploy the dashboard, share the URL, all driven by the agents you already use.
- **Knowledge management built in.** Business meaning, approved definitions, and proven examples are captured as reviewable, version-controlled context, not buried in prompts.
- **Open by default.** Open-sourced core, SDK, and skills under the Apache-2.0 license.
- **Correctness as primitives.** Rich schema retrieval, dry-plan validation, structured errors with hints, value profiling, eval runner. The agent orchestrates; the trace lives in its reasoning.
- **Sits on top of your existing stack.** Warehouse, transformation pipelines, your existing semantic layer. Not another tool to maintain.

## How Quill compares

|  | A raw LLM agent | A traditional BI tool | A bare semantic layer | **Quill** |
|---|:---:|:---:|:---:|:---:|
| Writes SQL for you | ✅ (often wrong) | ❌ | ❌ | ✅ governed |
| Knows your business definitions | ❌ | partial, in-tool | ✅ (schema only) | ✅ + non-schema knowledge |
| Generates & deploys dashboards | ❌ | ✅ (manual, in-tool) | ❌ | ✅ agent-driven |
| Works through *your* agents (Claude Code, Cursor, MCP…) | ✅ | ❌ | ❌ | ✅ |
| Open, reviewable, Git-friendly context | ❌ | ❌ | partial | ✅ |
| Governed execution across 22+ sources | ❌ | per-connector | ✅ (definitions only) | ✅ |

## Quill is for you if…

- You want **AI agents to produce trustworthy BI**, answers *and* dashboards, not just plausible SQL.
- Your business logic (definitions, enums, units, approved joins) lives **outside the database** and your agents keep getting it wrong.
- You want context that's **open, reviewable, and version-controlled**, usable by every agent and person, not gated behind one vendor's UI.

**Skip Quill if** you only need a one-off chart from a single CSV, or you're happy letting an agent guess at SQL with no governance.

## Quickstart

Quill is **agent-driven by design**: install the CLI, install a one-file
discovery stub for your AI client, then let your AI agent drive the rest.
Workflow guides live inside the CLI itself and are served on demand, so
content always matches the installed version.

### 1. Install the CLI

```bash
pip install quill                      # core (DuckDB included)
pip install "quill[postgres,memory]"   # add per-datasource and memory extras as needed
```

> **Tip for users in mainland China:** If `pip install` is slow or fails, use the Tsinghua mirror:
> ```bash
> pip install quill -i https://pypi.tuna.tsinghua.edu.cn/simple
> ```
> If HuggingFace model downloads time out, add `export HF_ENDPOINT=https://hf-mirror.com` before running the CLI.

### 2. Install the discovery stub for your AI client

```bash
npx skills add omen18/QuillAI            # auto-detects Claude Code, Cursor, Cline, Codex, …
```

The stub is ~50 lines. It teaches your agent to fetch workflow guides via
`quill skills get <name>` and shaped prompts via
`quill ask "<question>" --guided|--direct`, and everything else lives in the CLI.

### 3. Ask your agent to set things up

Open your agent in a project directory and say something like:

> "Use Quill to set up my Postgres database."

The agent runs `quill skills get onboarding`, follows the guide step-by-step,
checks your environment, creates a connection profile, scaffolds the project,
and runs a first query.

### 4. (Optional) Enrich the project: the *Know* beat

Once onboarding finishes, ask:

> "Enrich my Quill project with the business context in `raw/`."

The agent runs `quill skills get enrich-context` and follows the guide in
**grill** mode (one question at a time) or **auto-pilot** mode (agent reads
`<project>/raw/` and proposes). Both modes write to MDL, instructions,
queries, and memory, all reviewable, all Git-friendly.

### 5. Ask questions: the *Generate* beat

> "Who are our top 10 customers by sales this quarter?"

Your agent fetches MDL context, recalls similar past queries, writes
governed SQL, and executes via `quill query`.

### 6. Build & deploy a dashboard: the *Deploy* beat

> "Turn that into an interactive dashboard I can filter and share, and deploy it to Vercel."

The agent runs `quill skills get genbi`, builds a browser-side GenBI app from
your project's context, previews it locally, and ships it to your own Vercel
or Cloudflare Pages account, returning a live, shareable URL. See the
[Build & deploy a GenBI app guide](https://github.com/omen18/QuillAI/tree/main/docs).

**Want to try it without your own database?** Ask your agent to use the
bundled `jaffle_shop` sample dataset. Same flow, querying a real warehouse
end-to-end in a couple of minutes.

## Two beats first, then the third

```bash
# Day 1 (agent-driven)
quill skills get onboarding         # workflow guide: set up project + first query  (Generate)
quill skills get enrich-context     # workflow guide: add business context           (Know)
quill skills get genbi              # workflow guide: build & deploy a dashboard      (Deploy)

# Day-to-day
quill query --sql '...'             # query through the MDL semantic layer
quill ask "<question>" --guided     # wrap a question for a weaker agent
quill ask "<question>" --direct     # wrap a question for a stronger agent
```

Fast at first. Deep when you need it. Always reviewable and Git-friendly.

## What's Included

- **Modeling Definition Language (MDL)**: models, columns, relationships, views, cubes, metrics, row-level / column-level access control (RLAC / CLAC)
- **Engine**: Apache DataFusion based, 22+ data sources
- **GenBI dashboards**: agent-built, browser-side apps powered by [`quill-core-wasm`](https://github.com/omen18/QuillAI/tree/main/core/quill-core-wasm), deployable to Vercel / Cloudflare Pages
- **Knowledge & memory**: business meaning in version-controlled `instructions.md` and `queries.yml`, plus a local LanceDB memory index (hybrid retrieval) for recall
- **Agent SDK**: `quill-langchain` (LangChain / LangGraph), `quill-pydantic`; reference Python integration for other stacks
- **Governed execution primitives**: functions, dry-plan, row limits, access control

## What's next

- **End-to-end correctness primitives**: value profiling, rich retrieval, structured errors, golden eval runner
- **Agent-native distribution**: first-class SDKs across major agent frameworks; see [GitHub Discussions](https://github.com/omen18/QuillAI/discussions) for what's prioritized next
- **Full governed execution**: audit logs, rate limits, approval workflow, data-flow inspector

Full roadmap and design notes: see the [introduction](https://github.com/omen18/QuillAI/tree/main/docs).

## A note on the "GenBI" name

"GenBI" now refers to this open-source generative-BI capability: agents that
**generate** governed answers and **deploy** dashboards on top of Quill's context
layer. The earlier **Quill GenBI** app, the Docker-based chat-first BI
product, is now **Quill GenBI Classic**, preserved on the
[`legacy/v1`](https://github.com/omen18/QuillAI/tree/legacy/v1) branch (no new
features or security fixes). For a maintained, hosted version of that classic
experience, see [Quill Commercial](https://github.com/omen18/QuillAI).

## Documentation

- [Quickstart](https://github.com/omen18/QuillAI/tree/main/docs): from skill install to first answer
- [Build & deploy a GenBI app](https://github.com/omen18/QuillAI/tree/main/docs): generate a dashboard and ship it
- [Concepts](https://github.com/omen18/QuillAI/tree/main/docs): what context is, what MDL is, how memory works
- [Connect a database](https://github.com/omen18/QuillAI/tree/main/docs): Postgres, BigQuery, Snowflake, DuckDB, and more
- [Agent SDKs](https://github.com/omen18/QuillAI/tree/main/docs): what's shipping today, what's next

## Community

- 💬 [Discord](https://discord.gg/5DvshJqG8Z): chat with the team and other builders
- 🐙 [GitHub Discussions](https://github.com/omen18/QuillAI/discussions): design conversations, RFCs, longer threads
- 🐦 [Twitter / X](https://github.com/omen18/QuillAI): release notes and short updates
- 🗞 [Blog](https://github.com/omen18/QuillAI): vision, post-mortems, deep dives

## Contributing

We build in the open. Issues, PRs, connector contributions, SDK integrations, docs fixes are all welcome.

- [Contributor guide](./CONTRIBUTING.md)
- [Connector ecosystem program](./docs/contributing-a-connector.md): three-tier ownership (official, community-blessed, community-owned)
- [Architecture map](./docs/architecture.md): find the right place to land your change
- Looking for somewhere to start? Try the [`good first issue`](https://github.com/omen18/QuillAI/labels/good%20first%20issue) label.

<details>
<summary><strong>Project structure</strong> (click to expand)</summary>

```
core/
  quill-core/         Rust semantic engine (Apache DataFusion)
  quill-core-base/    Shared manifest types + MDL builder
  quill-core-py/      Python bindings (PyPI: quill-core)
  quill-core-wasm/    WebAssembly build (npm: quill-core-wasm)
  quill/              Python SDK and CLI (PyPI: quill)
  quill-mdl/          MDL JSON schema
sdk/
  quill-langchain/    Reference agent SDK integration
skills/              Agent skills for context authoring
docs/                Module documentation
examples/            Example projects
```

</details>

## Contributors

<a href="https://github.com/omen18/QuillAI/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=omen18/QuillAI" alt="Quill contributors" />
</a>

## License

Apache 2.0. See [LICENSE](./LICENSE).

---

<div align="center">

*Come build open GenBI with us.*

**If Quill helps you, drop a ⭐, it genuinely helps us grow!**

<p><a href="#top">⬆️ Back to top</a></p>

</div>
