---
sidebar_label: Kode
---

# Install Quill with Kode

shareAI Kode coding agent.

## Prerequisites

- [Kode](https://github.com/shareAI-lab/kode) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent kode
```

## Run onboarding

```bash
kode
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
