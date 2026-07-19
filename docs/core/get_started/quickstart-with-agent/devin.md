---
sidebar_label: Devin for Terminal
---

# Install Quill with Devin for Terminal

Cognition Devin CLI.

## Prerequisites

- [Devin for Terminal](https://devin.ai) installed and authenticated.
- A Devin subscription is required.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent devin
```

## Run onboarding

```bash
devin
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
