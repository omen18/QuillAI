# quill

[![PyPI version](https://img.shields.io/pypi/v/quill.svg)](https://pypi.org/project/quill/)
[![Python](https://img.shields.io/pypi/pyversions/quill.svg)](https://pypi.org/project/quill/)
[![License](https://img.shields.io/pypi/l/quill.svg)](https://github.com/omen18/QuillAI/blob/main/LICENSE)

Quill CLI and Python SDK — semantic SQL layer for 20+ data sources.

Translate natural SQL queries through an [MDL (Modeling Definition Language)](https://github.com/omen18/QuillAI/tree/main/docs/) semantic layer and execute them against your database. Powered by [Apache DataFusion](https://datafusion.apache.org/).

## Installation

```bash
pip install quill                 # Core (DuckDB included)
pip install 'quill[postgres]'     # PostgreSQL
pip install 'quill[mysql]'        # MySQL
pip install 'quill[bigquery]'     # BigQuery
pip install 'quill[snowflake]'    # Snowflake
pip install 'quill[clickhouse]'   # ClickHouse
pip install 'quill[trino]'        # Trino
pip install 'quill[mssql]'        # SQL Server
pip install 'quill[databricks]'   # Databricks
pip install 'quill[redshift]'     # Redshift
pip install 'quill[spark]'        # Spark
pip install 'quill[athena]'       # Athena
pip install 'quill[oracle]'       # Oracle
pip install 'quill[memory]'       # Schema & query memory (LanceDB)
pip install 'quill[ui]'           # Browser-based profile form (starlette + uvicorn)
pip install 'quill[main]'         # memory + interactive prompts + ui
pip install 'quill[all]'          # All connectors + main
```

Requires Python 3.11+.

## Quick start

**1. Initialize a project** — scaffolds a YAML-based MDL project:

```bash
mkdir my-project && cd my-project
quill context init
```

This creates `quill_project.yml`, `models/`, and `views/`. Edit `quill_project.yml` to set your `data_source` and add models under `models/`:

```yaml
# quill_project.yml
schema_version: 2
name: my_project
catalog: quill
schema: public
data_source: postgres
```

```yaml
# models/orders/metadata.yml
name: orders
table_reference:
  schema: mydb
  table: orders
columns:
  - name: order_id
    type: integer
  - name: customer_id
    type: integer
  - name: total
    type: double
  - name: status
    type: varchar
primary_key: order_id
```

> **Already have an MDL JSON?** Import it directly:
> `quill context init --from-mdl path/to/mdl.json`

**2. Configure a connection profile:**

```bash
# Browser form (recommended, requires quill[ui])
quill profile add my-db --ui

# Interactive terminal prompts
quill profile add my-db --interactive

# Import from an existing connection file
quill profile add my-db --from-file connection_info.json
```

**3. Build the manifest:**

```bash
quill context build
```

This compiles YAML files into `target/mdl.json`. The CLI auto-discovers this file when you run queries from within the project directory.

**4. Run queries:**

```bash
quill --sql 'SELECT order_id FROM "orders" LIMIT 10'
```

`quill` walks up from the current directory to find `quill_project.yml` and uses `target/mdl.json`. You can also pass `--mdl path/to/mdl.json` explicitly.

For the full CLI reference and per-datasource connection field reference, see [`docs/cli.md`](docs/cli.md) and [`docs/connections.md`](docs/connections.md).

**4a. (Optional) Aggregation queries with cubes** — define cubes under `cubes/`,
then query them with a structured input instead of writing `GROUP BY` SQL by hand:

```bash
quill cube list
quill cube describe revenue
quill cube query --cube revenue --measures total --time-dimension "order_date:month"
```

The translator produces `DATE_TRUNC` / `GROUP BY` / `WHERE` clauses for you and
runs them through the same engine path as `quill --sql`. See the
[Cube guide](../../docs/core/guides/modeling/cube.md) for full YAML structure
and the [CLI reference](../../docs/core/reference/cli.md#quill-cube--pre-aggregation-queries) for all
flags.

**5. (Optional) Configure security policy** — create `~/.quill/config.json`:

```json
{
  "strict_mode": true,
  "denied_functions": ["pg_read_file", "dblink", "lo_import"]
}
```

| Key | Default | Description |
|-----|---------|-------------|
| `strict_mode` | `false` | When `true`, every table in a query must be defined in the MDL. Queries referencing undeclared tables are rejected before execution. |
| `denied_functions` | `[]` | List of function names (case-insensitive) that are forbidden in queries. |

**6. (Optional) Index schema for semantic search** (requires `quill[memory]`):

```bash
quill memory index                              # index MDL schema
quill memory fetch -q "customer order price"    # fetch relevant schema context
quill memory store --nl "top customers" --sql "SELECT ..."  # store NL→SQL pair
quill memory recall -q "best customers"         # retrieve similar past queries
quill memory watch                              # auto-reindex on schema/query changes
```

**7. (Optional) Build a shareable GenBI app** — turn the context layer into a
browser-side dashboard (powered by `quill-core-wasm`) and deploy it to Vercel or
Cloudflare Pages. The CLI owns the build instruction + deterministic state; an
agent authors the app from it:

```bash
quill genbi build sales --prompt "orders dashboard" --data-mode snapshot  # print build instruction
# agent authors apps/sales/ from the instruction (mdl.json + data/*.parquet)
quill genbi register sales --data-mode snapshot   # record the app
quill genbi verify sales                          # preflight (files, MDL, data, secret scan)
quill genbi open sales                            # local preview
quill genbi deploy sales --provider vercel        # ship a shareable URL (preview; --prod for production)
```

Tokens come from the env / `.env` (`VERCEL_TOKEN` / `CLOUDFLARE_API_TOKEN`),
never CLI flags; Cloudflare needs `wrangler` installed. See the
[GenBI guide](../../docs/core/guides/genbi.md) and the
[CLI reference](../../docs/core/reference/cli.md#quill-genbi--build--deploy-genbi-apps).

**8. (Optional) Serve an MCP server** — expose the project's query, schema, and
knowledge tools to Claude Desktop/Code, Cursor, or any MCP client. Runs
in-process against the compiled MDL — no ibis-server, no separate service:

```bash
quill serve mcp                                # stdio (default) — client spawns this as a child process
quill serve mcp --transport http --port 8080   # local Streamable HTTP for other clients
```

Requires `quill context build` to have already run and the `mcp` extra:
`pip install 'quill[mcp]'`. See the
[MCP guide](../../docs/core/guides/mcp.md) and the
[CLI reference](../../docs/core/reference/cli.md#quill-serve--mcp-server) for
the full tool/resource list and client wiring.

---

## Connection profiles

Profiles let you store named connection configurations in `~/.quill/profiles.yml` and switch between them easily — useful when working across multiple databases or environments.

```bash
# Add a profile (browser form, interactive prompts, or file import)
quill profile add prod --ui                        # opens http://localhost:<port>
quill profile add staging --interactive            # terminal prompts
quill profile add local --from-file conn.json      # import existing file

# List and switch profiles
quill profile list                                 # * marks the active profile
quill profile switch prod

# Inspect a profile (sensitive fields masked)
quill profile debug prod

# Remove a profile
quill profile rm old-profile --force
```

The `--ui` flag opens a browser-based form that auto-derives fields from each datasource's schema — including file upload for BigQuery credentials, variant selection for Databricks/Redshift, and sensible defaults for all 20+ supported sources. Requires `pip install 'quill[ui]'`.

Once a profile is active, `quill` uses it automatically:

```bash
quill profile switch prod
quill --sql 'SELECT COUNT(*) FROM "orders"'        # connects using prod profile
```

---

## Python SDK

```python
import base64, orjson
from quill import QuillEngine, DataSource

manifest = { ... }  # your MDL dict
manifest_str = base64.b64encode(orjson.dumps(manifest)).decode()

with QuillEngine(manifest_str, DataSource.mysql, {"host": "...", ...}) as engine:
    result = engine.query('SELECT * FROM "orders" LIMIT 10')
    print(result.to_pandas())
```

---

## Development

Prerequisites: `just` and `uv`. (Rust + Cargo are only needed for the
local-engine recipes below.)

### Standard setup (no Rust toolchain)

```bash
just install        # uv sync — pulls the prebuilt quill-core-py wheel from PyPI
just lint           # Ruff format check + lint
just format         # Auto-fix
```

`just install` is a plain `uv sync`: it installs the locked prebuilt `quill-core-py` engine binding and the development tools from uv's default `dev` dependency group. No compilation required. This is enough for all Python-side development. Use `just install-extra <extra>` or `just install-all` for data-source extras.

### Engine development (changing the Rust core)

Only needed when you modify `../quill-core-py` (or `../quill-core`) and want
`core/quill` to run against your local build. Requires Rust + Cargo.

```bash
just install-local    # uv sync + build the local wheel + overlay it into .venv
just use-local-core   # rebuild + re-overlay after each subsequent Rust change
```

The run recipes (`just test*`, `just lint`, `just dev`) use `uv run --no-sync`,
so they never revert a locally overlaid engine back to the lockfile version. If
dependencies change, re-run an install recipe first.

| Command | What it runs | Docker needed |
|---------|-------------|---------------|
| `just test-unit` | Unit tests (engine, CTE rewriter, field registry, profiles) | No |
| `just test-duckdb` | DuckDB connector tests | No |
| `just test-postgres` | PostgreSQL connector tests | Yes |
| `just test-mysql` | MySQL connector tests | Yes |
| `just test` | All tests | Yes |

Profile web tests (`test_profile_web.py`) require `quill[ui]`:

```bash
uv sync --extra ui
uv run --no-sync pytest tests/test_profile_web.py -v
```

## Publishing

```bash
./scripts/publish.sh            # Build + publish to PyPI
./scripts/publish.sh --test     # Build + publish to TestPyPI
./scripts/publish.sh --build    # Build only
```

## Package rename: `quill-engine` → `quill`

Starting with the 0.7.0 release, this PyPI distribution is renamed from
[`quill-engine`](https://pypi.org/project/quill-engine/) to
[`quill`](https://pypi.org/project/quill/) to align with the **Quill**
brand. The legacy `quill-engine` project on PyPI is frozen at 0.6.x and
will not receive further updates.

### What stays the same

- The Python import path: `import quill` (and submodules under `quill.*`)
- The `quill` CLI entrypoint and every subcommand (`quill query`,
  `quill context`, `quill profile`, `quill memory`, …)
- All extras (`postgres`, `mysql`, `bigquery`, …, `memory`, `ui`, `main`,
  `all`)
- Configuration files under `~/.quill/` (profiles, memory, config)

Only the name you type after `pip install` is different.

### Migration

```bash
pip uninstall quill-engine
pip install quill                  # or: pip install "quill[<extras>]"
quill --version                      # should print: quill X.Y.Z
```

If your project pinned `quill-engine` in a `requirements.txt`,
`pyproject.toml`, or lockfile, replace it with `quill` and re-lock.

## License

Apache-2.0
