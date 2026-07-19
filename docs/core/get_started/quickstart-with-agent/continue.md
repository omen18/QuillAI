---
sidebar_label: Continue
---

# Install Quill with Continue

Open-source IDE coding assistant.

## Prerequisites

- [Continue](https://continue.dev) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent continue
```

## Run onboarding

Open your project folder in VS Code or a JetBrains IDE with the Continue extension installed, then open the Continue chat panel (`⌘L` / `Ctrl+L` on VS Code, `⌘J` / `Ctrl+J` on JetBrains).

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
