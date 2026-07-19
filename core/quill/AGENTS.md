# AGENTS.md

This project uses [Quill Engine](https://github.com/omen18/Quill) as the semantic layer for data querying. Queries are written against MDL model names, not raw database tables.

## Answering data questions

When the user asks about data, metrics, reports, or business questions, follow this workflow:

1. `quill memory fetch -q "<question>"` — get relevant schema context
2. `quill memory recall -q "<question>" --limit 3` — find similar past queries
3. Write SQL using model names from the MDL (not raw table names)
4. `quill --sql "<sql>"` — execute through the semantic layer
5. `quill memory store --nl "<question>" --sql "<sql>"` — store confirmed results

If this is the first query in the session, also run `quill context instructions` to load business rules.

## Modifying the data model

When the user wants to add models, change schema, or onboard a new table:

1. Edit YAML files in `models/`, `views/`, or `relationships.yml`
2. `quill context validate` — check structure
3. `quill context build` — compile to `target/mdl.json`
4. `quill memory index` — re-index schema for search

## Capturing business context

Rules the schema can't express — canonical tables, default filters, units, enum meanings — go in `knowledge/rules/*.md` (read by `quill context instructions`). Confirmed NL→SQL examples are saved with `quill memory store` (step 5 above), which writes them to `knowledge/sql/`. Both live in the project and are committed with it.

## Prerequisites

This project requires the `quill` CLI. Install with your data source extra:

```bash
pip install "quill[postgres,memory,ui]"
```

Replace `postgres` with your data source (`mysql`, `bigquery`, `snowflake`, `clickhouse`, `trino`, `mssql`, `databricks`, `redshift`, `spark`, `athena`, `oracle`). The `memory` extra upgrades recall to semantic (embedding) search — without it, `memory store` / `index` / `recall` still work over the `knowledge/` files. `ui` enables the interactive UI.

See https://github.com/omen18/Quill/tree/main/docs/oss/engine/get_started/installation for full setup.

## Quick reference

| Task | Command |
|------|---------|
| Run a query | `quill --sql "SELECT ..."` |
| Preview planned SQL | `quill dry-plan --sql "SELECT ..."` |
| Show available models | `quill context show` |
| Check connection | `quill profile debug` |
| Check memory index | `quill memory status` |
| Rebuild after changes | `quill context build && quill memory index` |
