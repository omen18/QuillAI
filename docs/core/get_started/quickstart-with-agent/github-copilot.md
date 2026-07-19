---
sidebar_label: GitHub Copilot
---

# Install Quill with GitHub Copilot

GitHub Copilot CLI / Coding Agent.

## Prerequisites

- [GitHub Copilot](https://github.com/features/copilot) installed and authenticated.
- A Copilot subscription is required. Agent skills may be preview-gated for your account.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent github-copilot
```

## Run onboarding

Open your project folder in VS Code (or another supported IDE) with GitHub Copilot installed, then open Copilot Chat with `⌃⌘I` / `Ctrl+Alt+I`.

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
