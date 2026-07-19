---
sidebar_label: Cline
---

# Install Quill with Cline

Open-source autonomous coding agent for VS Code.

## Prerequisites

- [Cline](https://cline.bot) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent cline
```

## Run onboarding

Open your project folder in VS Code with the Cline extension installed, then click the Cline icon in the Activity Bar to open the chat panel.

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
