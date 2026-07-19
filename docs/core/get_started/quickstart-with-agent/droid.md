---
sidebar_label: Droid
---

# Install Quill with Droid

Factory AI Droid CLI.

## Prerequisites

- [Droid](https://docs.factory.ai/cli) installed and authenticated.
- Factory login required.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent droid
```

## Run onboarding

```bash
droid
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
