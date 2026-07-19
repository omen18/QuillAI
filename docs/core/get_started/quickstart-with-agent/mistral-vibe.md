---
sidebar_label: Mistral Vibe
---

# Install Quill with Mistral Vibe

Mistral's Vibe coding agent.

## Prerequisites

- [Mistral Vibe](https://mistral.ai) installed and authenticated.
- Mistral account login required.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent mistral-vibe
```

## Run onboarding

```bash
vibe
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
