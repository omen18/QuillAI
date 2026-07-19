# Changelog

This file tracks repository-level changes (layout, licensing, governance). Per-package release notes live in each package's own `CHANGELOG.md` (e.g. `core/quill/CHANGELOG.md`, `core/quill-core-py/CHANGELOG.md`) and are managed by release-please.

## 2026-Q2 — Repo consolidation

- **Imported** [`omen18/quillai-engine`](https://github.com/omen18/quillai-engine) into [`core/`](./core) via `git filter-repo` rewrite, preserving authorship and PR history (~5,300 commits across `core/quill-core`, `core/quill-core-base`, `core/quill-core-py`, `core/quill-core-wasm`, `core/quill`).
- **Relocated** the existing `quill-mdl/` schema to `core/quill-mdl/`.
- **Archived** the legacy Quill GenBI app (`quill-service`, `quill-ui`, `quill-launcher`, `docker`, `deployment`) on the [`legacy/v1`](https://github.com/omen18/QuillAI/tree/legacy/v1) branch (tag `v1-final`).
- **Adopted** a multi-license layout (Apache 2.0 for code/skills/SDKs/examples; CC BY 4.0 for docs; AGPL 3.0 reserved for future modules). See [LICENSE](./LICENSE).
- **Added** root metadata: `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, this `CHANGELOG.md`.
