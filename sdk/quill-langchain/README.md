# quill-langchain

LangChain and LangGraph integration for [Quill Core](https://github.com/omen18/Quill).

Attach a CLI-prepared Quill project to a LangChain agent in three lines:

```python
from quill_langchain import QuillToolkit
from langchain.agents import create_agent

toolkit = QuillToolkit.from_project("./analytics_db")
agent = create_agent(
    model="openai:gpt-4o",
    tools=toolkit.get_tools(),
    system_prompt=toolkit.system_prompt(),
)
```

Complete runnable demos:

- [`examples/langchain_demo.py`](./examples/langchain_demo.py) — uses
  ``langchain.agents.create_agent``, the high-level factory. Smallest
  amount of code; recommended starting point.
- [`examples/langgraph_demo.py`](./examples/langgraph_demo.py) — builds the
  ReAct loop from LangGraph primitives (`StateGraph` + `ToolNode` +
  conditional edges). Use this when you need custom routing, state, or
  streaming.

## Prerequisites

This package assumes you have already used the Quill CLI to prepare a project:

```bash
quill context init
quill context build
quill memory index   # optional but recommended
quill profile add ...
```

If you haven't installed the CLI yet, install `quill` first:

```bash
pip install "quill[memory,postgres]"
```

## Installation

`quill-langchain` exposes datasource and memory extras that pass through to
the matching `quill` extras, so you only have to install once:

```bash
# Match the datasource your quill_project.yml uses (DuckDB needs no extra):
pip install "quill-langchain[mysql]"
pip install "quill-langchain[postgres,memory]"
pip install "quill-langchain[bigquery,memory]"

# Available datasource extras: postgres, mysql, bigquery, snowflake,
# clickhouse, trino, mssql, databricks, redshift, spark, athena, oracle.

# `memory` extra enables the three memory tools (quill_fetch_context,
# quill_recall_queries, quill_store_query). Without it the toolkit exposes
# only the three runtime tools.

# Install everything for experimentation:
pip install "quill-langchain[all,memory]"
```

If you prefer to install `quill` separately (e.g. you already use the
CLI), the bare package is enough and your existing `quill` extras carry
over:

```bash
pip install quill-langchain
```

## What you get

`QuillToolkit.from_project(path)` exposes:

- **6 LLM-facing tools** (3 runtime + 3 memory when `.quill/memory/` exists):
  - `quill_query` — execute SQL through Quill's context layer, returns rows
  - `quill_dry_plan` — plan SQL without execution to verify it targets models correctly
  - `quill_list_models` — list project models with column counts and descriptions
  - `quill_fetch_context` — retrieve relevant schema/business context for a question
  - `quill_recall_queries` — surface similar past NL→SQL pairs as few-shot examples
  - `quill_store_query` — persist a confirmed NL→SQL pair for future recall
- **Direct Python API**:
  ```python
  toolkit.query("SELECT ...")             # → pyarrow.Table
  toolkit.dry_plan("SELECT ...")           # → str (target-dialect SQL)
  toolkit.dry_run("SELECT ...")            # → None (validation only)
  toolkit.memory.fetch("revenue trends")
  toolkit.memory.recall("top customers")
  toolkit.memory.store(nl="...", sql="...", tags=["..."])
  ```
- **`toolkit.system_prompt()`** — Quill-aware system prompt that adapts to enabled tools and includes your project's `instructions.md` when present.

## Configuration

```python
QuillToolkit.from_project(
    path,                # required — path to your prepared Quill project
    profile="prod",      # optional — picks a named profile (default: active)
)

toolkit.get_tools(
    include_memory_write=True,   # set False to keep memory read-only
    raise_on_error=False,        # set True to surface exceptions to LangChain retry
)
```

Memory is **auto-detected** from the project: present `<path>/.quill/memory/`
exposes the 3 memory tools alongside the 3 runtime tools; absent → only the
runtime tools. To enable, run `quill memory index` from the project root; to
disable, delete the directory. There is no override kwarg.

`include_memory_write=False` removes `quill_store_query` from the returned
list while keeping `quill_fetch_context` and `quill_recall_queries`. Use this
when you want the agent to read curated past pairs but never persist new
ones (e.g., a shared / pinned memory). When memory is disabled, this flag
has no effect — no memory tools are returned regardless.

### How `path`, `profile`, and `.env` interact

Three pieces of state combine to produce a connection. Understanding which
one drives what avoids surprises:

| Source | Holds | Resolved by |
|---|---|---|
| `path/quill_project.yml` + `target/mdl.json` | MDL models, schema, `data_source` | `from_project(path)` |
| `path/.env` | Secret values (`MYSQL_HOST`, `MYSQL_PASSWORD`, …) | `from_project(path)` auto-loads it |
| `~/.quill/profiles.yml` | Connection template (`host: ${MYSQL_HOST}`, …) | `profile=` kwarg or fallback chain |

**`profile=` resolution chain** (highest priority first):

1. Explicit `profile="<name>"` kwarg passed to `from_project`.
2. The `profile:` field inside the project's `quill_project.yml`, e.g.:
   ```yaml
   schema_version: 3
   data_source: mysql
   profile: test-project3   # locks this project to a specific profile
   ```
3. The globally active profile (`quill profile switch <name>`).

### When does `profile=` actually change which database you connect to?

This is subtle, because **profile values are templates that resolve from the
project's `.env`**, not standalone connection records. Three scenarios:

**Scenario A — `profile=` is a no-op (most common)**

Your `~/.quill/profiles.yml` has multiple profiles that all use the same
placeholder names:

```yaml
profiles:
  test-project3:
    datasource: mysql
    host: ${MYSQL_HOST}
    database: ${MYSQL_DATABASE}
  test-project4:
    datasource: mysql
    host: ${MYSQL_HOST}        # ← same placeholder
    database: ${MYSQL_DATABASE}
```

Because `from_project("/path/to/test-project3")` loads `test-project3/.env`
into the environment, **both profiles resolve to the same connection** —
`${MYSQL_HOST}` reads from project3's `.env` regardless of which profile
name you picked. Profile selection is cosmetic in this layout.

**Scenario B — `profile=` selects different placeholders**

```yaml
profiles:
  dev:
    host: ${DEV_HOST}
  prod:
    host: ${PROD_HOST}
```

Now `profile="dev"` and `profile="prod"` read different env vars from the
same `.env`, so the choice matters.

**Scenario C — `profile=` selects hardcoded values or different datasources**

```yaml
profiles:
  local:
    datasource: duckdb
    url: /tmp/local.duckdb
    format: duckdb
  remote:
    datasource: postgres
    host: prod-db.example.com   # hardcoded
    port: 5432
```

`profile="local"` vs `profile="remote"` connect to genuinely different
databases. Note: if `quill_project.yml` specifies `data_source:` and you
pick a profile with a different `datasource:`, the connection will fail —
the project's MDL is built against one specific dialect.

### Recommendation: one project, one profile

If you follow the common pattern of **one Quill project per database**
(each project gets its own `.env` and points at its own DB), set the
profile inside `quill_project.yml` and stop passing `profile=`:

```yaml
# quill_project.yml
schema_version: 3
name: test-project3
data_source: mysql
profile: test-project3
```

```python
toolkit = QuillToolkit.from_project("/path/to/test-project3")
```

This pins the project to its intended profile, no more "is the active
profile what I think it is?" — and it survives `quill profile switch`
elsewhere on the same machine.

## Compatibility matrix

| `quill-langchain` | `quill` | `langchain` | `langgraph` |
|---|---|---|---|
| 0.1.0 | >= 0.7.0 | >= 1.0 | >= 1.0 |

## Known limitations (v0.1)

- **Synchronous tools only.** LangChain auto-bridges to a thread pool when tools run in async LangGraph; multi-tenant servers serving > ~32 concurrent users may exhaust the default executor pool.
- **One toolkit per agent.** If you need to query multiple Quill projects, build separate agents.
- **Memory is auto-detected** from `.quill/memory/` and there is no kwarg to override. To enable, run `quill memory index`; to disable, delete the directory.
- **No hot reload mechanism.** `target/mdl.json` is re-read on every tool call, so `quill context build` updates from CLI are picked up automatically. Profile changes require constructing a new toolkit.
- **Don't run `quill memory index` while an agent is using the same project.** The index operation drops and recreates the LanceDB schema table; concurrent reads may transiently fail.

## License

Apache License 2.0. See [LICENSE](./LICENSE) for the full text, or the
[repository-level LICENSE](../../LICENSE) for the path-to-license map.

The names "Quill", "Quill", and the project's logos are trademarks of
Yash Raj Sharan and are not licensed under Apache 2.0; their use is governed
separately.
