---
sidebar_label: CodeBuddy
---

# Install Quill with CodeBuddy

Tencent CodeBuddy coding agent.

## Prerequisites

- [CodeBuddy](https://www.codebuddy.ai) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent codebuddy
```

## Run onboarding

Open your project in CodeBuddy IDE (or the VS Code extension), then open the CodeBuddy chat panel.

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
