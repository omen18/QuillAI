# CLI reference

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

Both flat and MCP/web envelope formats are accepted:

```bash
# Flat format
{"datasource": "postgres", "host": "localhost", "port": 5432, ...}

# Envelope format (auto-unwrapped)
{"datasource": "duckdb", "properties": {"url": "/data", "format": "duckdb"}}
```

---

## `quill memory` — Schema & Query Memory

LanceDB-backed semantic memory for MDL schema search and NL→SQL retrieval. Install with the `main` extra bundle (includes `memory`, `interactive`, `ui`):

```bash
pip install 'quill[main]'   # includes memory, interactive, ui
```

All `memory` subcommands accept `--path DIR` to override the default storage location (`~/.quill/memory/`).

> **Note:** The `memory` extra bundles ~800MB of large unsigned native libraries (lancedb plus sentence-transformers/torch). On macOS, the first command that loads the memory stack can trigger a one-time XProtect/Gatekeeper scan and pause for up to about a minute before it finishes; this is normal macOS behavior, not a Quill error, and happens once per install or fresh virtual environment. With lazy memory loading, lightweight non-`memory` commands are unaffected — the scan is deferred to your first real memory use, not eliminated.

### Hybrid strategy: full text vs. embedding search

When providing schema context to an LLM, there is a trade-off:

- **Small schemas** — the full plain-text description fits easily in the LLM context window and gives better results because the LLM sees the complete structure (model→column relationships, join paths, primary keys) rather than isolated fragments from a vector search.
- **Large schemas** — the full text exceeds what is practical to send in a single prompt, so embedding search is needed to retrieve only the relevant fragments.

`quill memory fetch` automatically picks the right strategy based on the **character length** of the generated plain-text description:

| Schema size | Threshold | Strategy |
|---|---|---|
| Below 30,000 chars (~8K tokens) | Default | Returns full plain text |
| Above 30,000 chars | Default | Returns embedding search results |

The threshold is measured in characters (not tokens) because character length is free to compute, while accurate token counting requires a tokeniser. The 4:1 chars-to-tokens ratio holds for English; CJK text compresses less (~1.5:1), so a CJK-heavy schema switches to embedding search sooner — which is the conservative direction.

The default threshold (30,000 chars) can be overridden with `--threshold`.

### `quill memory index`

Parse the MDL manifest and index all schema items (models, columns, relationships, views) into LanceDB with local embeddings.

```bash
quill memory index                          # uses ~/.quill/mdl.json
quill memory index --mdl /path/to/mdl.json  # explicit MDL file
```

### `quill memory watch`

Watch project sources and auto-reindex on change so semantic recall never serves a stale
schema while you are actively modelling. Polls `target/mdl.json` and `knowledge/sql/*.md`
on an interval; when their content fingerprint changes it runs the equivalent of
`quill memory index`. A failed reindex leaves the change pending and is retried on the next
poll — an update is never silently dropped. Runs until `Ctrl+C`.

Requires the `memory` extra. With the grep backend there is no derived index to keep
fresh, so this command exits with a message.

| Flag | Description |
|------|-------------|
| `--interval`, `-i` | Seconds between polls (min 1). Default: `5`. |
| `--reindex-on-start` / `--no-reindex-on-start` | Reindex once on startup before watching. Default: off. |
| `--max-polls` | Stop after N polls (mainly for scripting/testing). Default: run until Ctrl+C. |
| `--mdl` | Explicit MDL file (must live under the watched project root). |
| `--path` | Project root to watch. Defaults to the discovered project. |

```bash
quill memory watch                    # poll every 5s, reindex on change
quill memory watch -i 2                # poll every 2s
quill memory watch --reindex-on-start  # ensure the index is fresh before the first interval
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
quill memory fetch -q "日期" --threshold 50000 --output json
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

Store a natural-language-to-SQL pair for future few-shot retrieval.

```bash
quill memory store \
  --nl "show top customers by revenue" \
  --sql "SELECT c_name, sum(o_totalprice) FROM orders JOIN customer GROUP BY 1 ORDER BY 2 DESC" \
  --datasource postgres
```

### `quill memory recall`

Search stored NL→SQL pairs by semantic similarity to a query.

```bash
quill memory recall -q "best customers"
quill memory recall -q "月度營收" --datasource mysql --limit 5 --output json
```

| Flag | Description |
|------|-------------|
| `-q, --query` | Search query (required) |
| `-l, --limit` | Max results (default: 3) |
| `-d, --datasource` | Filter by data source |
| `-o, --output` | Output format: `table` (default), `json` |

### `quill memory status`

Show index statistics: storage path, table names, and row counts.

```bash
quill memory status
# Path: /Users/you/.quill/memory
#   schema_items: 47 rows
#   query_history: 12 rows
```

### `quill memory reset`

Drop all memory tables and start fresh.

```bash
quill memory reset          # prompts for confirmation
quill memory reset --force  # skip confirmation
```
