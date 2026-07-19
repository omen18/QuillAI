---
sidebar_label: iFlow CLI
---

# Install Quill with iFlow CLI

iFlow CLI agent.

## Prerequisites

- [iFlow CLI](https://platform.iflow.cn) installed and authenticated.
- iFlow account required.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent iflow-cli
```

## Run onboarding

```bash
iflow
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
