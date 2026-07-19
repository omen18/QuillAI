---
sidebar_label: Roo Code
---

# Install Quill with Roo Code

Open-source VS Code coding agent.

## Prerequisites

- [Roo Code](https://roocode.com) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent roo
```

## Run onboarding

Open your project folder in VS Code with the Roo Code extension installed, then click the Roo icon in the Activity Bar to open the chat panel.

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
