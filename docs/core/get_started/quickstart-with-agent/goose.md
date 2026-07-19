---
sidebar_label: Goose
---

# Install Quill with Goose

Block's open-source coding agent.

## Prerequisites

- [Goose](https://block.github.io/goose) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent goose
```

## Run onboarding

```bash
goose session
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
