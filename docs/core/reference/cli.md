# CLI Reference

## Default command — query

Running `quill --sql '...'` executes a query and prints the result. This is the same as `quill query --sql '...'`.

```bash
quill --sql 'SELECT COUNT(*) FROM "orders"'
quill --sql 'SELECT * FROM "orders" LIMIT 5' --output csv
quill --sql 'SELECT * FROM "orders"' --limit 100 --output json
```

Output formats: `table` (default), `csv`, `json`.

## `quill query`

Execute SQL and return results.

```bash
quill query --sql 'SELECT order_id, total FROM "orders" ORDER BY total DESC LIMIT 5'
```

## `quill dry-plan`

Translate MDL SQL to the native dialect SQL for your data source. No database connection required.

```bash
quill dry-plan --sql 'SELECT order_id FROM "orders"'
quill dry-plan --sql 'SELECT order_id FROM "orders"' -d postgres  # explicit datasource, no connection file needed
```

## `quill dry-run`

Dry-run SQL against the live database without returning rows. Prints `OK` on success, `Error: <reason>` on failure.

```bash
quill dry-run --sql 'SELECT * FROM "orders" LIMIT 1'
# OK

quill dry-run --sql 'SELECT * FROM "NonExistent"'
# Error: table not found ...
```

## Overriding defaults

All flags are optional when `~/.quill/mdl.json` and `~/.quill/connection_info.json` exist.

The data source is always read from the `datasource` field in `connection_info.json` (or the inline `--connection-info` value). Only `dry-plan` accepts `--datasource` / `-d` as an override for transpile-only use without a connection file.

```bash
quill --sql '...' \
  --mdl /path/to/other-mdl.json \
  --connection-file /path/to/prod-connection_info.json
```

Or pass connection info inline:

```bash
quill --sql 'SELECT COUNT(*) FROM "orders"' \
  --connection-info '{"datasource":"mysql","host":"localhost","port":3306,"database":"mydb","user":"root","password":"secret"}'
```

Both flat and envelope formats are accepted:

```bash
# Flat format
{"datasource": "postgres", "host": "localhost", "port": 5432, ...}

# Envelope format (auto-unwrapped)
{"datasource": "duckdb", "properties": {"url": "/data", "format": "duckdb"}}
```

---

## `quill profile import dbt`

Import the active dbt target from `profiles.yml` into `~/.quill/profiles.yml`.

```bash
quill profile import dbt --project-dir ./jaffle_shop
quill profile import dbt --project-dir ./jaffle_shop --target prod --name jaffle-prod
```

Common flags: `--profiles-path`, `--profile`, `--target`, `--name`, `--no-activate`.

## `quill context import dbt`

Generate a Quill project from dbt artifacts.

```bash
quill context import dbt --project-dir ./jaffle_shop --path ./quill-jaffle
quill context import dbt --project-dir ./jaffle_shop --path ./quill-jaffle --dry-run
```

Requires `target/manifest.json` and `target/catalog.json`; run `dbt build` and `dbt docs generate` first. See [dbt Integration](../guides/dbt-integration.md).

---

## `quill context upgrade`

Upgrade a project to the latest layout (`schema_version` 5). Forward-only and idempotent;
the v4→v5 step creates the `knowledge/` skeleton.

```bash
quill context upgrade --dry-run   # preview created/modified files
quill context upgrade             # apply
quill context upgrade --to 5      # target a specific version
```

To migrate `instructions.md` and the LanceDB memory into `knowledge/`, see
[Migration](./migration.md).

---

## `quill docs` — Connection Info

### `quill docs connection-info <datasource>`

Print the required and optional connection fields for a data source.

```bash
quill docs connection-info postgres
quill docs connection-info bigquery
quill docs connection-info snowflake
```

Use this to check which fields are needed before creating a profile.

---

## `quill memory` — Schema & Query Memory

Schema and NL-SQL memory. NL→SQL pairs live in `knowledge/sql/*.md` (the source of truth);
the LanceDB index is a derived artifact rebuilt from them.

`store`, `index`, and `recall` work **without** any extra — pairs are written to and
searched over `knowledge/sql/` directly (token/substring matching). Install the `memory`
extra only for **semantic** (embedding) recall and schema search (`quill memory fetch`):

```bash
pip install 'quill[memory]'
# or combine with main for the browser UI and interactive prompts:
pip install 'quill[memory,main]'
```

The backend is chosen automatically — LanceDB when the extra is installed, otherwise the
dependency-free grep backend. Force one with `QUILL_MEMORY_BACKEND=grep|lancedb`. All
`memory` subcommands accept `--path DIR` to override the LanceDB storage location
(`~/.quill/memory/`).

> **Note:** The `memory` extra bundles ~800MB of large unsigned native libraries (lancedb plus sentence-transformers/torch). On macOS, the first command that loads the memory stack can trigger a one-time XProtect/Gatekeeper scan and pause for up to about a minute before it finishes; this is normal macOS behavior, not a Quill error, and happens once per install or fresh virtual environment. With lazy memory loading, lightweight non-`memory` commands are unaffected — the scan is deferred to your first real memory use, not eliminated.

### Hybrid strategy: full text vs. embedding search

When providing schema context to an LLM, there is a trade-off:

- **Small schemas** — the full plain-text description fits easily in the LLM context window and gives better results because the LLM sees the complete structure (model-column relationships, join paths, primary keys) rather than isolated fragments from a vector search.
- **Large schemas** — the full text exceeds what is practical to send in a single prompt, so embedding search is needed to retrieve only the relevant fragments.

`quill memory fetch` automatically picks the right strategy based on the **character length** of the generated plain-text description:

| Schema size | Threshold | Strategy |
|---|---|---|
| Below 30,000 chars (~8K tokens) | Default | Returns full plain text |
| Above 30,000 chars | Default | Returns embedding search results |

The threshold is measured in characters (not tokens) because character length is free to compute, while accurate token counting requires a tokeniser. The 4:1 chars-to-tokens ratio holds for English; CJK text compresses less (~1.5:1), so a CJK-heavy schema switches to embedding search sooner — which is the conservative direction.

The default threshold (30,000 chars) can be overridden with `--threshold`.

### `quill memory index`

Build the semantic index: schema items (models, columns, relationships, views) plus the
NL→SQL pairs from `knowledge/sql/*.md` (re-running converges on the markdown). Requires the
`memory` extra. Without it, the grep backend reads `knowledge/sql/` directly, so there is
nothing to build and this command is a no-op.

```bash
quill memory index                          # uses ~/.quill/mdl.json
quill memory index --mdl /path/to/mdl.json  # explicit MDL file
```

### `quill memory watch`

Watch project sources and auto-reindex on change, so semantic recall never serves a
stale schema while you are actively modelling. Polls `target/mdl.json` and
`knowledge/sql/*.md` on an interval; when their content fingerprint changes it runs the
equivalent of `quill memory index`. A reindex that fails leaves the change pending and is
retried on the next poll — an update is never silently dropped. Runs until `Ctrl+C`.

Requires the `memory` extra (the index it maintains is LanceDB-backed). With the grep
backend there is no derived index to keep fresh, so this command exits with a message.

| Flag | Description |
|------|-------------|
| `--interval`, `-i` | Seconds between polls (min 1). Default: `5`. |
| `--reindex-on-start` / `--no-reindex-on-start` | Reindex once on startup before watching. Default: off. |
| `--max-polls` | Stop after N polls (mainly for scripting/testing). Default: run until Ctrl+C. |
| `--mdl` | Explicit MDL file (must live under the watched project root). |
| `--path` | Project root to watch. Defaults to the discovered project. |

```bash
quill memory watch                       # poll every 5s, reindex on change
quill memory watch -i 2                   # poll every 2s
quill memory watch --reindex-on-start     # ensure the index is fresh before the first interval
```

### `quill memory describe`

Print the full schema as structured plain text. No embedding or LanceDB required — this is a pure transformation of the MDL manifest into a human/LLM-readable format.

```bash
quill memory describe                          # uses ~/.quill/mdl.json
quill memory describe --mdl /path/to/mdl.json
```

### `quill memory fetch`

Get schema context for an LLM. Automatically chooses the best strategy based on schema size: full plain text for small schemas, embedding search for large schemas.

When using the search strategy, optional `--type` and `--model` filters narrow the results.

```bash
quill memory fetch -q "customer order price"
quill memory fetch -q "revenue" --type column --model orders
quill memory fetch -q "order date" --threshold 50000 --output json
```

| Flag | Description |
|------|-------------|
| `-q, --query` | Search query (required) |
| `--mdl` | Path to MDL JSON file |
| `-l, --limit` | Max results for search strategy (default: 5) |
| `-t, --type` | Filter: `model`, `column`, `relationship`, `view` (search strategy only) |
| `--model` | Filter by model name (search strategy only) |
| `--threshold` | Character threshold for full vs search (default: 30,000) |
| `-o, --output` | Output format: `table` (default), `json` |

### `quill memory store`

Store a natural-language-to-SQL pair. Writes `knowledge/sql/<slug>.md` (the source of
truth, no extra required), then indexes it into LanceDB when the `memory` extra is present.

```bash
quill memory store \
  --nl "show top customers by revenue" \
  --sql "SELECT c_name, sum(o_totalprice) FROM orders JOIN customer GROUP BY 1 ORDER BY 2 DESC" \
  --datasource postgres
```

### `quill memory recall`

Search stored NL-SQL pairs — semantic similarity with the `memory` extra, token/substring
matching (grep) without it. Each hit is annotated with its `knowledge/sql/*.md` path.

```bash
quill memory recall -q "best customers"
quill memory recall -q "monthly revenue" --datasource mysql --limit 5 --output json
```

| Flag | Description |
|------|-------------|
| `-q, --query` | Search query (required) |
| `-l, --limit` | Max results (default: 3) |
| `-d, --datasource` | Filter by data source |
| `-o, --output` | Output format: `table` (default), `json` |

### `quill memory export`

One-time migration: export an existing LanceDB `query_history` into `knowledge/sql/*.md`
(source, timestamp, and dedup preserved). Requires the `memory` extra to read LanceDB;
leaves LanceDB intact. See [Migration](./migration.md).

```bash
quill memory export                 # query_history → knowledge/sql/*.md
quill memory export --include-seed   # also export auto-generated seed pairs
```

### `quill memory check`

Report drift between `knowledge/sql/*.md` and the derived index (which user pairs are not
indexed, or indexed without a markdown source).

```bash
quill memory check
```

### `quill memory status`

Show index statistics: storage path, table names, and row counts.

```bash
quill memory status
# Path: /Users/you/.quill/memory
#   schema_items: 47 rows
#   query_history: 12 rows
```

### `quill memory reset`

Drop the derived LanceDB index. Your `knowledge/sql/*.md` source files are **preserved** —
rebuild the index any time with `quill memory index`.

```bash
quill memory reset          # prompts for confirmation
quill memory reset --force  # skip confirmation
```

---

## `quill cube` — Pre-aggregation Queries

For aggregation queries where the MDL defines cubes, use `quill cube` instead
of writing raw SQL. The translator produces correct `GROUP BY`, `DATE_TRUNC`,
and `WHERE` clauses from a structured input.

### `quill cube list`

List all cubes in the loaded MDL with their measures and dimensions.

```bash
quill cube list
```

### `quill cube describe <name>`

Pretty-print the full cube schema as JSON: `baseObject`, measures (with
expressions), dimensions, time dimensions, hierarchies.

```bash
quill cube describe revenue
```

### `quill cube query`

Build a CubeQuery and translate it to SQL via quill-core, then execute through
the same path as `quill --sql`. Two input modes:

**CLI flags:**

```bash
quill cube query \
  --cube revenue \
  --measures total,order_count \
  --dimensions status \
  --time-dimension "order_date:month:2024-01-01,2025-01-01" \
  --filter "status:eq:completed" \
  --limit 100
```

**JSON input** (`--from <file|->`):

```bash
cat query.json | quill cube query --from -
```

| Flag | Description |
|------|-------------|
| `--cube` | Cube name (required unless using `--from`) |
| `--measures` | Comma-separated measure names (required unless using `--from`) |
| `--dimensions` | Comma-separated dimension names |
| `--time-dimension` | `<name>:<granularity>[:start,end]` — one time dimension with optional date range |
| `--filter` | Repeatable. `<dimension>:<operator>[:value]`. For `in` / `not_in`, value is comma-separated. |
| `--limit` / `--offset` | Pagination |
| `--from <file\|->` | Load CubeQuery as JSON from a file or stdin |
| `--sql-only` | Print the generated SQL and exit without executing |
| `--mdl` | Path to MDL JSON (defaults to `<project>/target/mdl.json`) |
| `--output` | `table` (default), `json`, `csv` |

**Supported granularities:** `year`, `quarter`, `month`, `week`, `day`, `hour`, `minute`.

**Supported filter operators:** `eq`, `neq`, `in`, `not_in`, `gt`, `gte`, `lt`,
`lte`, `contains`, `starts_with`, `is_null`, `is_not_null`.

See the [Cube guide](../guides/cubes.md) for YAML structure and
validation rules.

---

## `quill serve` — MCP Server

Serve the project's query, schema, and knowledge tools to MCP clients (Claude
Desktop/Code, Cursor, any MCP-capable IDE) as a local MCP server. The server
embeds the engine in-process — no ibis-server, no separate backend — so it
runs from a bare project checkout as long as `quill context build` has run.

### `quill serve mcp`

```bash
quill serve mcp                                  # stdio (default) — client spawns this as a child process
quill serve mcp --transport http --port 8080     # local Streamable HTTP for multiple / remote clients
```

Requires the `mcp` extra: `pip install 'quill[mcp]'`.

| Flag | Default | Description |
|------|---------|-------------|
| `--transport` | `stdio` | `stdio` or `http` |
| `--host` | `127.0.0.1` | Bind host, `--transport http` only |
| `--port` | `8080` | Bind port, `--transport http` only |
| `--project` | discovered | Override project root |
| `--profile` | active profile | Connection profile name |
| `--allow-write` | off | Enable the `store_query` write tool |
| `--no-connect` | off | Transpile-only mode: disable `run_sql`, `dry_run`, `query_cube` |
| `--quiet` / `-q` | off | Suppress the client-registration help banner |

On startup the server prints (to stderr) ready-to-copy registration commands for
the running invocation — a `claude mcp add` / `codex mcp add` command for
`--transport http`, and those plus a JSON `mcpServers` config block for stdio
(reflecting `--project`, `--profile`, `--allow-write`, and `QUILL_HOME`). Pass
`--quiet` to suppress it.

Requires `target/mdl.json` to exist (`quill context build` first) — errors with
a hint otherwise. If project source files (`models/`, `views/`, `cubes/`,
`relationships.yml`, `quill_project.yml`) are newer than `target/mdl.json`, it
warns that the MDL may be stale but still serves it — it never auto-builds.

### Client wiring (stdio)

```json
{
  "command": "quill",
  "args": ["serve", "mcp"],
  "cwd": "/path/to/project"
}
```

For `--transport http`, connect the client to the Streamable HTTP endpoint at
`http://<host>:<port>` instead of spawning a process. Binds to `127.0.0.1` by
default; there is no bearer-token auth in this version — treat it as local-only.

### Tools

| Group | Tools |
|---|---|
| Query | `run_sql`, `dry_run`, `dry_plan`, `query_cube` |
| Schema | `get_mdl`, `list_models`, `describe_model`, `get_data_source`, `list_cubes`, `describe_cube`, `list_functions` |
| Knowledge | `get_instructions`, `recall_queries`, `get_context`, `describe_schema`, `list_stored_queries`, `list_knowledge` |
| Write (`--allow-write`) | `store_query` |

`run_sql`, `dry_run`, and `query_cube` are disabled under `--no-connect`.
`store_query` is only registered when `--allow-write` is passed.

The knowledge tools degrade gracefully without the `memory` extra:
`get_context` (semantic schema retrieval, the schema-axis twin of
`recall_queries`) falls back to the full plain-text schema description;
`describe_schema` (the human-readable counterpart to `get_mdl`) needs no
optional dependency at all; `list_stored_queries` enumerates every NL→SQL
pair (not just a semantic top-k) from `knowledge/sql/*.md`; `list_knowledge`
lists every file readable via the `quill://knowledge/{path}` resource below.

### Resources & prompt

- `quill://mdl` — compiled MDL JSON
- `quill://instructions` — business rules from `knowledge/rules/*.md`
- `quill://project` — project name / catalog / schema / data source / schema_version / knowledge_schema_version
- `quill://agents` — the project's `AGENTS.md`, if present
- `quill://knowledge/{path}` — read any file under `knowledge/` (e.g.
  `quill://knowledge/knowledge.yml`, `quill://knowledge/rules/general.md`);
  rejects any path that escapes the project's `knowledge/` directory
- `quill_workflow` prompt — packages the schema → instructions → recall →
  dry-run → run_sql → query_cube → store SOP for a connecting agent

### Security

Connection secrets are resolved from the profile once at server startup and
never cross the MCP boundary — only SQL text, query results, and metadata are
exposed to the client.

See the [MCP guide](../guides/mcp.md) for a walkthrough of wiring a client.

---

## `quill skills` — Agent Workflow Guides

The CLI ships its own agent skill content. Use this on any AI client (the
content is the same — content travels with the wheel, not the agent cache).

### `quill skills list`

List the available workflow guides.

```bash
quill skills list
```

### `quill skills get <name>`

Print a skill's main guide to stdout. Five names ship today:
`onboarding`, `usage`, `generate-mdl`, `dlt-connector`, `enrich-context`.

```bash
quill skills get onboarding              # set up Quill end-to-end
quill skills get usage                   # day-to-day querying
quill skills get generate-mdl            # MDL from a database schema
quill skills get dlt-connector           # connect SaaS sources via dlt
quill skills get enrich-context          # add business context (units, enums, cubes)
```

### `quill skills get <name> --full`

Include the skill's reference docs inline (sorted, separated). For skills
that have no `references/`, the output is identical to the non-`--full` form.

### `quill skills get <name> --script <s>`

Print a bundled script's source to stdout. Currently:

```bash
quill skills get dlt-connector --script introspect_dlt > introspect_dlt.py
python introspect_dlt.py --duckdb-path ./pipeline.duckdb --output-dir ./project
```

---

## `quill ask` — Prompt Shaping

Wrap a natural-language question in one of two bundled templates and print
the rendered prompt to stdout. **Does not execute any query** — it
produces a prompt for an agent to consume.

You must explicitly pick one mode (no default — silently changing a
default would alter agent behavior across an upgrade).

### `quill ask "<question>" --guided`

For weaker LLMs. Prepends a strict task flow (`quill context show` →
`quill memory recall` → write SQL → `quill dry-plan` → `quill query`).

```bash
quill ask "top 5 customers by revenue" --guided
```

### `quill ask "<question>" --direct`

For stronger LLMs. Minimal wrapping; the agent decides which quill commands
to run.

```bash
quill ask "monthly orders trend" --direct
```

## `quill genbi` — Build & Deploy GenBI Apps

Turn a project's context layer into a shareable, browser-side GenBI web app
(powered by `quill-core-wasm`) and deploy it to Vercel or Cloudflare Pages.

**CLI ↔ agent split:** the CLI owns the authoritative build instruction and all
deterministic state (the app index, verify, deploy). The agent authors the app
code by following the instruction. `.quill/apps.yml` is only ever written by the
CLI — never by hand. The matching agent workflow guide is `quill skills get
genbi`.

### `quill genbi build <name>`

Print a project-hydrated build instruction (wasm wiring with the pinned
`quill-core-wasm` version, the project's model/column inventory, data-mode
guidance, acceptance criteria, and the target folder). Writes no app files; it
only compiles `target/mdl.json` first if it's missing.

```bash
quill genbi build sales-overview --prompt "orders dashboard" --data-mode snapshot
# --prompt-file <file> / --prompt -    read a long prompt from a file or stdin
# --data-mode snapshot|live            snapshot (default): bundle data with the app
#                                      live: app calls a CORS endpoint at view time
```

### `quill genbi register <name>` / `list` / `remove <name>`

Machine-written app index (`<project>/.quill/apps.yml`).

```bash
quill genbi register sales-overview --data-mode snapshot   # record an authored app
quill genbi list                                           # apps + status + deploy state
quill genbi remove sales-overview                          # drop index entry (files kept)
```

App names must be simple slugs (letters, numbers, `_`, `-`); names containing
path separators are rejected so they can't escape `<project>/apps/`.

### `quill genbi verify <name>`

Deterministic deploy preflight (no browser): required files exist, `mdl.json`
parses, snapshot apps ship a `.parquet`/`.duckdb` asset, and a default-deny
secret scan flags inlined credentials. `deploy` gates on this. The secret scan
is best-effort defense-in-depth, not a guarantee — never inline secrets.

### `quill genbi open <name>`

Serve a built app locally for preview (blocking; Ctrl-C stops).

```bash
quill genbi open sales-overview --port 8848   # 0 = auto-pick
```

### `quill genbi deploy <name>`

Verify, then ship to the user's provider account and return a shareable URL.
Preview by default; `--prod` deploys to production (confirm with the user
first).

```bash
quill genbi deploy sales-overview --provider vercel        # or cloudflare
quill genbi deploy sales-overview --provider vercel --prod
```

- **Tokens** are discovered from the environment or `.env` files
  (`VERCEL_TOKEN` / `CLOUDFLARE_API_TOKEN`) — never passed as CLI flags.
  Cloudflare also needs `CLOUDFLARE_ACCOUNT_ID`.
- **Cloudflare** shells out to the `wrangler` CLI (`npm install -g wrangler`,
  or have `npx` available) — Pages has no single inline-upload REST endpoint.
- **Vercel Deployment Protection:** new Vercel projects return HTTP 401 to
  logged-out visitors by default. To make the URL public, disable it at
  Project → Settings → Deployment Protection. The deploy itself succeeded;
  the URL is just gated.
