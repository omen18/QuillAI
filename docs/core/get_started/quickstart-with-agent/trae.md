---
sidebar_label: Trae
---

# Install Quill with Trae

ByteDance Trae IDE.

## Prerequisites

- [Trae](https://trae.ai) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent trae
```

## Run onboarding

Open your project folder in Trae IDE (`File → Open Folder...`), then open the chat panel with `⌘U` / `Ctrl+U`.

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
