---
sidebar_label: Kimi Code CLI
---

# Install Quill with Kimi Code CLI

Moonshot Kimi CLI. Uses the shared `.agents/skills/` directory.

## Prerequisites

- [Kimi Code CLI](https://moonshotai.github.io/kimi-cli) installed and authenticated.
- Moonshot API key required.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent kimi-cli
```

## Run onboarding

```bash
kimi
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
