---
sidebar_label: Codex
---

# Install Quill with Codex

OpenAI Codex CLI.

## Prerequisites

- [Codex](https://developers.openai.com/codex) installed and authenticated.
- OpenAI account login required.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent codex
```

## Run onboarding

```bash
codex
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
