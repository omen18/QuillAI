---
sidebar_label: Amp
---

# Install Quill with Amp

Sourcegraph's coding agent. Uses the shared `.agents/skills/` directory.

## Prerequisites

- [Amp](https://ampcode.com) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent amp
```

## Run onboarding

```bash
amp
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
