---
sidebar_label: Quickstart (jaffle_shop)
---

import ArchStrip from '@site/src/components/ArchStrip';

# Quick Start: Quill CLI with jaffle_shop

Ask natural-language questions of the **jaffle_shop** dataset using **Quill CLI** and **Claude Code**. No cloud database, no Docker, no extra infrastructure.

> **Time:** ~15 minutes
>
> **What you'll get:** A local context layer + memory system that lets an AI agent write accurate SQL by understanding your data's meaning, not just its schema.

<ArchStrip variant="cli" />

## Terms used in this guide

This guide drops three things on you in the first few steps. Skim before you start:

- **Quill CLI (`quill`)**: the Python CLI that runs all of this. Connects to a database, holds your modeling files, executes SQL through the context layer, manages a local memory index. ([CLI reference →](/oss/reference/cli))
- **MDL (Modeling Definition Language)**: YAML files under `models/`, `views/`, and `relationships.yml` that describe your tables, columns, and joins in business terms. The agent reads MDL instead of guessing from raw schema. ([MDL concept →](/oss/concepts/what_is_mdl) · [Quill project guide →](/oss/reference/mdl))
- **jaffle_shop**: a public sample database from dbt Labs. We use it so you do not need to bring your own database to follow this quickstart. It is a fictional ecommerce business with `customers`, `orders`, `products`, and `supplies`. *(Want to skip jaffle_shop and use your own database? Finish the install in step 2 then jump to [Connect your database](/oss/guides/connect).)*
- **Skills**: markdown workflow guides that tell an AI coding agent (Claude Code, Openclaw, Hermes, Codex, etc.) how to operate the CLI. You install one `quill` discovery stub; it fetches the guides from the CLI on demand. Two guides drive this quickstart: `generate-mdl` (one-time scaffolding) and `usage` (day-to-day querying). ([Skills concept →](/oss/reference/skills))

---

## Prerequisites

- **Claude Code**: installed and authenticated ([install guide](https://docs.anthropic.com/en/docs/claude-code/overview))
- **Python 3.11+**
- **Node.js / npm**: required if using `npx` to install skills (see Step 3)
- **Git**

---

## Step 0: Create a Python virtual environment

Create and activate a virtual environment before installing any packages. This keeps dbt and quill dependencies isolated from your system Python:

```bash
python3 -m venv ~/.venvs/quill
source ~/.venvs/quill/bin/activate
```

> **Tip:** Activate this environment (`source ~/.venvs/quill/bin/activate`) in every new terminal session before running `dbt` or `quill` commands.

---

## Step 1: Seed the jaffle_shop dataset

Clone the dbt jaffle\_shop project and build the DuckDB database:

```bash
git clone https://github.com/dbt-labs/jaffle_shop_duckdb.git
cd jaffle_shop_duckdb
pip install dbt-core dbt-duckdb
dbt build
```

Verify the database file was created:

```bash
ls jaffle_shop.duckdb
```

Note the **absolute path** to this directory. You'll need it when setting up the profile:

```bash
pwd
# e.g. /Users/you/jaffle_shop_duckdb
```

---

## Step 2: Install quill Python package

For this quickstart, install with **DuckDB + memory + UI + interactive prompts**:

```bash
pip install "quill[memory,main]"
```

DuckDB is included by default, so no extra is needed. For other data sources, append the connector extra (e.g. `pip install "quill[memory,main,postgres]"`).

> **Available extras:**
> - `postgres`, `mysql`, `bigquery`, `snowflake`, `clickhouse`, `trino`, `mssql`, `databricks`, `redshift`, `athena`, `oracle`, `spark`: data source connectors
> - `memory`: LanceDB-backed semantic memory (NL-SQL recall, embedding retrieval). **Optional** but recommended for the quickstart.
> - `main`: interactive prompts + browser-based profile UI

Verify the installation:

```bash
quill version
```

---

## Step 3: Install the CLI skill

Skills are workflow guides that tell your AI coding agent how to use the Quill CLI effectively. Install the discovery stub. It fetches the guides from the CLI on demand:

```bash
npx skills add omen18/Quill
# or:
curl -fsSL https://raw.githubusercontent.com/omen18/Quill/main/skills/install.sh | bash
```

The CLI auto-detects your installed agent. To target a specific one, add `--agent <name>` (e.g., `claude-code`, `cursor`, `windsurf`, `cline`). Only one skill (`quill`) is installed; the workflow guides below are served on demand with `quill skills get <name>`.

This quickstart uses two of those guides:

| Guide | Purpose |
|-------|---------|
| **usage** | Day-to-day workflow: gather context, recall past queries, write SQL, store results |
| **generate-mdl** | One-time setup: explore database schema and generate the MDL project |

For the full guide list (including `onboarding` and `dlt-connector`), see the [Skills reference](/oss/reference/skills).

---

## Step 4: Set up a profile

A profile stores your database connection info (like dbt profiles). Create one for the jaffle\_shop DuckDB database:

### Option A: Browser UI (recommended)

```bash
quill profile add jaffle-shop --ui
```

This opens a browser form. Fill in:

- **Data source:** `duckdb`
- **Database path:** `/Users/you/jaffle_shop_duckdb`, the **directory** containing `.duckdb` files, not the `.duckdb` file itself (your absolute path from Step 1)

### Option B: Interactive CLI

```bash
quill profile add jaffle-shop --interactive
```

Follow the prompts to enter profile name, data source, and connection fields.

### Option C: From file

Create a YAML file `jaffle-profile.yml`:

```yaml
datasource: duckdb
url: /Users/you/jaffle_shop_duckdb
format: duckdb
```

Then import it:

```bash
quill profile add jaffle-shop --from-file jaffle-profile.yml
```

---

Verify the profile is active:

```bash
quill profile list
```

You should see `jaffle-shop` marked as active. Test the connection:

```bash
quill profile debug
```

---

## Step 5: Initialize a Quill project

Create a new directory for your project and scaffold the project structure:

```bash
mkdir -p ~/jaffle-quill && cd ~/jaffle-quill
quill context init
```

This creates:

```
~/jaffle-quill/
├── quill_project.yml        # project metadata
├── models/                 # one folder per table
├── views/                  # reusable SQL views
├── cubes/                  # pre-aggregation metrics
├── relationships.yml       # table join definitions
└── knowledge/              # business rules + NL→SQL pairs for the AI
```

The generated `quill_project.yml` contains default values for `catalog` and `schema`:

> **Note:** `catalog` and `schema` in `quill_project.yml` define the **Quill namespace**. They have nothing to do with your database's catalog or schema. Keep the defaults (`quill` / `public`). The actual database location of each table is specified per-model in the `table_reference` section.

Bind the profile you just created to this project:

```bash
quill context set-profile jaffle-shop
```

This writes `profile: jaffle-shop` and `data_source: duckdb` into `quill_project.yml`, locking this project to its connection. Future commands (and the SDK) use the bound profile regardless of which profile is globally active, so `quill profile switch` elsewhere can't accidentally redirect this project's queries.

---

## Step 6: Generate MDL with Claude Code

First, remove the example model and view that `quill context init` created. They are placeholders and will be replaced by the generated models:

```bash
rm -rf models/example_model views/example_view
```

Now let Claude Code explore the database and generate the MDL project files. Open Claude Code **in the project directory**:

```bash
cd ~/jaffle-quill
claude
```

Then ask:

```
Use the /quill skill to explore the jaffle_shop database
and generate the MDL for all tables. The data source is DuckDB.
```

The `quill` skill recognizes this as a scaffolding task and pulls in the `generate-mdl` guide (`quill skills get generate-mdl`) to drive it.

Claude Code will:

1. **Discover tables**: `customers`, `orders`, `products`, `supplies`, etc.
2. **Introspect columns and types** using SQLAlchemy or `information_schema`
3. **Normalize types** via `quill utils parse-type`
4. **Write model YAML files**, one folder per table under `models/`
5. **Infer relationships** from foreign keys and naming conventions
6. **Add descriptions**: Claude may ask you to describe key tables/columns
7. **Validate and build**: `quill context validate` → `quill context build`
8. **Index memory**: `quill memory index` (generates seed NL-SQL examples)

> **Tip:** If `quill memory index` (the indexing step above) seems to hang for tens of seconds on macOS, it hasn't. That first `quill memory` command loads large unsigned native libraries (lancedb and torch, ~800MB), and macOS runs a one-time XProtect security scan the first time they execute. This is expected macOS behavior, not a Quill problem, and it's a one-off: every later `quill memory` command runs at normal speed. To avoid the pause during a live demo, run any `quill memory` command once right after install and let it finish.

After completion, verify the project:

```bash
quill context show
quill memory status
```

---

## Step 7: Start asking questions

You're ready to go. In Claude Code, just ask questions in natural language:

```
How many customers placed more than one order?
```

```
What are the top 5 products by total revenue?
```

```
Show me the monthly order count trend.
```

Behind the scenes, Claude Code uses the **usage** guide to:

1. **Fetch context** (`quill memory fetch`): find relevant tables and columns for your question
2. **Recall examples** (`quill memory recall`): find similar past queries
3. **Write SQL** using the context layer (model names, not raw table names)
4. **Execute** (`quill --sql "..."`): run through the Quill engine
5. **Store** (`quill memory store`): save successful NL-SQL pairs for future recall

The more you ask, the smarter the system gets. Each stored query improves future recall accuracy.

---

## Step 8: Add and query a cube (optional)

A **cube** is a semantic aggregation object: a model plus declared measures, dimensions, and time grains. `generate-mdl` scaffolds tables and relationships but not cubes, so add one now with Claude Code.

### Step 8a: Add a cube

In Claude Code:

```
Use the /quill skill to add a cube named "revenue" over the orders model:
total revenue as SUM(amount), an order count, broken down by status and
monthly by order_date.
```

Claude Code drafts the cube YAML, confirms with you, writes it to `cubes/revenue/metadata.yml`, and rebuilds the manifest.

> **Prefer to write it by hand?** See the [Cube guide](../guides/cubes.md) for the full YAML structure, then run `quill context build`.

### Step 8b: Query the cube

```bash
quill cube list

quill cube query \
  --cube revenue \
  --measures total,order_count \
  --time-dimension "order_date:month"
```

`--time-dimension` takes `<name>:<granularity>`. Add `--dimensions status` or `--filter "status:eq:completed"` to slice further. See the [Cube guide](../guides/cubes.md) and [CLI reference](../reference/cli.md#quill-cube--pre-aggregation-queries) for all options.

---

## Step 9: Build and deploy a GenBI dashboard (optional)

You have answers. Now turn one into a shareable report. GenBI builds a
browser-side dashboard from your project's context and deploys it to your own
Vercel or Cloudflare Pages account. You drive the whole thing through the agent.

In Claude Code:

```
Use the /quill skill to build a GenBI dashboard from the revenue cube:
monthly revenue and order count, filterable by status. Then preview it locally.
```

The `quill` skill pulls in the `genbi` guide (`quill skills get genbi`) and drives
the build:

1. **Build the instruction** (`quill genbi build`) hydrates the app spec with your MDL and the pinned `quill-core-wasm` version.
2. **Author the app** writes a self-contained app under `apps/<name>/`, choosing charts that answer the question.
3. **Snapshot the data** exports what the dashboard needs (default snapshot mode), so the app runs fully client-side with no backend.
4. **Verify and preview** (`quill genbi verify`, then `quill genbi open`) runs preflight checks and serves the app locally.

Open the preview URL the agent prints (for example `http://127.0.0.1:8848/`) and
click through it. Refine in plain language ("make it a bar chart", "drop the
status filter") and the agent rebuilds.

When it looks right, ask the agent to deploy:

```
Deploy the dashboard to Vercel.
```

You supply the deploy token: add `VERCEL_TOKEN` (or `CLOUDFLARE_API_TOKEN` plus
`CLOUDFLARE_ACCOUNT_ID`) to `~/.quill/.env`, then tell the agent to continue. It
runs `quill genbi deploy` and returns a shareable URL. Deploys go to a preview
URL by default; say "ship it to production" to promote it.

> **Heads-up:** new Vercel projects return HTTP 401 to logged-out visitors by
> default. The deploy still succeeded; to make the URL public, disable Vercel
> Authentication once at Project → Settings → Deployment Protection → Vercel
> Authentication → Disabled.

For the full walkthrough, see [Build and deploy a GenBI app](../guides/genbi.md).

---

## What's in the project

After setup, your project directory looks like this:

```
~/jaffle-quill/
├── quill_project.yml
├── models/
│   ├── customers/
│   │   └── metadata.yml        # table schema and descriptions
│   ├── orders/
│   │   └── metadata.yml
│   ├── products/
│   │   └── metadata.yml
│   └── supplies/
│       └── metadata.yml
├── views/
├── cubes/                      # only if you did Step 8
│   └── revenue/
│       └── metadata.yml        # measures + dimensions for aggregation
├── relationships.yml           # e.g. orders → customers (many_to_one)
├── knowledge/
│   ├── rules/                  # your business rules
│   └── sql/                    # confirmed NL→SQL pairs (quill memory store)
├── .quill/
│   └── memory/                 # LanceDB index (auto-managed)
└── target/
    └── mdl.json                # compiled manifest
```

Key files to customize:

- **`knowledge/rules/`**: Add business rules, naming conventions, or query guidelines — one markdown file per topic, organized with `##` headings. Example (`knowledge/rules/conventions.md`):

  ```markdown
  ## Naming Conventions
  - "revenue" always means order total, not supply cost
  - "active customers" means customers with at least one order in the last 90 days

  ## Query Rules
  - Always use order_date for time-based filtering, not created_at
  ```

- **`models/*/metadata.yml`**: Add or refine `properties.description` on models and columns. Better descriptions = better memory search.

- **`relationships.yml`**: Add or fix join conditions. Wrong relationships cause silent query errors.

After editing any file, rebuild and re-index:

```bash
quill context validate
quill context build
quill memory index
```

---

## Useful commands reference

| Task | Command |
|------|---------|
| Run SQL | `quill --sql "SELECT ..." -o table` |
| Preview planned SQL | `quill dry-plan --sql "SELECT ..."` |
| Validate SQL | `quill dry-run --sql "SELECT ..."` |
| Show project context | `quill context show` |
| Show instructions | `quill context instructions` |
| Build manifest | `quill context build` |
| Fetch context for a question | `quill memory fetch --query "..."` |
| Recall similar queries | `quill memory recall --query "..."` |
| Store a NL-SQL pair | `quill memory store --nl "..." --sql "..."` |
| Check memory status | `quill memory status` |
| Re-index memory | `quill memory index` |
| Switch profile | `quill profile switch <name>` |
| List profiles | `quill profile list` |

---

## Next steps

- **Add views** for frequently asked questions. Views with good descriptions become high-quality recall examples
- **Refine instructions** as you discover query patterns the AI gets wrong
