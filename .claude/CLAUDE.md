# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quill is an open-source semantic engine for MCP clients and AI agents. It translates SQL queries through a semantic layer (MDL — Modeling Definition Language) and executes them against 22+ data sources (PostgreSQL, BigQuery, Snowflake, Spark, etc.). The Rust engine is powered by Apache DataFusion (upstream, crates.io v53).

The previous Quill services (`quill-ui/`, `quill-service/`, `quill-launcher/`, `docker/`, `deployment/`) were moved to the `legacy/v1` branch (tag `v1-final`) as of the quill-engine import. Active development is focused on the Open Context Engine.

## Repository Structure

```
core/
├── quill-core/        Rust semantic engine (Cargo workspace; crates.io: quill-semantic-core, lib name quill_core)
├── quill-core-base/   Shared Rust crate — manifest types (Model, Column, Metric, Relationship, View) + ManifestBuilder (crates.io: quill-core-base)
├── quill-core-py/     PyO3 bindings exposing quill-core to Python (PyPI: quill-core)
├── quill-core-wasm/   WebAssembly build of quill-core for in-browser semantic SQL (npm: quill-core-wasm)
├── quill/             Python SDK and CLI — `quill` command, profile/context/memory management (PyPI: quill)
└── quill-mdl/         MDL JSON schema definition

docs/core/            Module documentation
examples/             Example projects (placeholder — to be populated)
skills/               CLI-based agent skills (quill-generate-mdl, quill-usage, quill-dlt-connector, quill-onboarding)
scripts/              Repo helper scripts
```

## Build & Development Commands

### core/quill-core (Rust)
```bash
cd core/quill-core
cargo check --all-targets                                  # compile check
cargo test --lib --tests --bins                            # tests (set RUST_MIN_STACK=8388608)
cargo fmt --all                                            # format
cargo clippy --all-targets --all-features -- -D warnings   # lint
taplo fmt                                                  # format Cargo.toml files
```

Most unit tests live in `core/quill-core/core/src/mdl/mod.rs`. SQL end-to-end tests use sqllogictest files in `core/quill-core/sqllogictest/test_files/`.

### core/quill-core-py (Python bindings)
```bash
cd core/quill-core-py
just install      # uv sync (deps only; --no-install-project)
just develop      # build dev wheel with maturin
just test-rs      # Rust tests (cargo test --no-default-features)
just test-py      # Python tests (pytest)
just test         # both
just format       # cargo fmt + ruff + taplo
```

### core/quill-core-wasm (WASM)
```bash
cd core/quill-core-wasm
just build        # wasm-pack build (browser target)
just test         # wasm-pack test
```
Outputs a ~68 MB WASM binary; distributed via npm and unpkg (jsDelivr's 50 MB per-file CDN limit blocks it).

### core/quill (SDK & CLI)
```bash
cd core/quill
just install              # uv sync (locked prebuilt quill-core-py wheel from PyPI; no Rust build)
just install-all          # with all optional extras (incl. memory)
just install-extra <e>    # e.g. just install-extra postgres
just install-memory       # memory extra (lancedb + sentence-transformers)
just install-local        # engine dev: uv sync + build local wheel + overlay
just use-local-core       # rebuild + re-overlay after Rust changes
just dev                  # run `quill` CLI
just test                 # pytest tests/
just test-memory          # memory-specific tests
just lint                 # ruff format --check + ruff check
just format               # ruff auto-fix
just build                # uv build (produces wheel)
```

Uses `uv` (not Poetry). `pyproject.toml` uses `hatchling` as build backend. Optional extras: `postgres`, `mysql`, `bigquery`, `snowflake`, `clickhouse`, `trino`, `mssql`, `databricks`, `redshift`, `spark`, `athena`, `oracle`, `memory`, `all`, `dev`.

## Architecture: Query Flow

```
SQL query
  → quill CLI / quill-core-py
  → quill-core (Rust): MDL analysis → logical plan → optimization
  → DataFusion (query planning, upstream crates.io v53)
  → connector-specific SQL (Ibis / sqlglot)
  → native execution on the target data source
```

## Key Architecture Details

**quill-core internals** (`core/quill-core/core/src/`):
- `mdl/` — Core MDL processing: `QuillMDL` (manifest + symbol table), `AnalyzedQuillMDL` (with lineage), function definitions per dialect (scalar/aggregate/window), type planning
- `logical_plan/analyze/` — DataFusion analyzer rules: `ModelAnalyzeRule` (TableScan → ModelPlanNode), scope tracking, access control (RLAC/CLAC), view expansion, relationship chain resolution
- `logical_plan/optimize/` — Optimization passes: type coercion, timestamp simplification
- `sql/` — SQL parsing and analysis

**Manifest types** (`core/quill-core-base/src/mdl/`):
- `manifest.rs` — `Manifest`, `Model`, `Column`, `Metric`, `Relationship`, `View`, `RowLevelAccessControl`, `ColumnLevelAccessControl`
- `builder.rs` — Fluent `ManifestBuilder` API
- Uses `quill-manifest-macro` for auto-generating Pydantic-compatible Python classes

## Known quill-core Limitations

**ModelAnalyzeRule — correlated subquery column resolution**: cannot resolve outer column references inside correlated subqueries; only sees the subquery's own table scope. Affects TPCH Q2, Q4, Q15, Q17, Q20, Q21, Q22.

## Conventions

- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, `perf:`, `deps:`). Releases are automated via release-please with independent release lines per module.
- **Rust**: format with `cargo fmt`, lint with `clippy -D warnings`, TOML with `taplo`.
- **Python**: format and lint with `ruff` (line-length 88, target Python 3.11). Both `core/quill-core-py` and `core/quill` use uv.
- **DataFusion**: upstream `datafusion` v53 from crates.io (no longer the upstream fork).
- **Snapshot testing**: quill-core uses `insta` for Rust snapshot tests.
- **CI**: Per-module path-filtered workflows trigger only on changes inside that module.
