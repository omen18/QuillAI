# Contributing to Quill

Thanks for your interest in contributing. Pull requests, bug reports, and discussion are all welcome.

## Before you start

- Read the **[Code of Conduct](./CODE_OF_CONDUCT.md)** — it applies to all project spaces.
- For bugs/feature requests: search [existing issues](https://github.com/omen18/Quill/issues) first; for open-ended ideas use [Discussions](https://github.com/omen18/Quill/discussions).
- For larger changes, open a discussion before coding so we can align on direction.

## Development per module

Each module under `core/` has its own dev setup. Start with the module's own `README.md`:

| Module | Entry point | Stack |
|---|---|---|
| [`core/quill-core/`](./core/quill-core) | `cargo check && cargo test` | Rust + DataFusion |
| [`core/quill-core-base/`](./core/quill-core-base) | `cargo test` | Rust |
| [`core/quill-core-py/`](./core/quill-core-py) | `just install && just test` | PyO3 + Maturin |
| [`core/quill-core-wasm/`](./core/quill-core-wasm) | `just build && just test` | wasm-pack |
| [`core/quill/`](./core/quill) | `just install && just test` | Python + uv |
| [`skills/`](./skills) | See `skills/AUTHORING.md` | CLI skill authoring |

## Conventions

- **Commit messages**: [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, `perf:`, `deps:`). Releases are automated via release-please with independent release lines per module.
- **Rust**: format with `cargo fmt`, lint with `clippy -D warnings`, format `Cargo.toml` with `taplo`.
- **Python**: format and lint with `ruff` (line length 88, target Python 3.11). Both `core/quill-core-py` and `core/quill` use `uv`.
- **Tests** must pass and lint must be clean before review. CI is path-filtered per module.

## Licensing of contributions

By submitting a pull request, you agree that your contribution is licensed under the same terms as the path it touches:

- Contributions to **`core/**`, `skills/**`, `sdks/integrations/**`, `examples/**`** and **root-level files** are licensed under [Apache License 2.0](./LICENSE-APACHE-2.0).
- Contributions to **`docs/**`** are licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](./LICENSE-CC-BY-4.0).

If a future module is introduced under [AGPL-3.0](./LICENSE-AGPL-3.0), contributions to that path will be licensed accordingly. See [LICENSE](./LICENSE) for the authoritative path-to-license map.

## Reporting security issues

Please do **not** open public issues for security vulnerabilities. See [SECURITY.md](./SECURITY.md) for details.
