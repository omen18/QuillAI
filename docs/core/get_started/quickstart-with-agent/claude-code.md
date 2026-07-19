---
sidebar_label: Claude Code
---

# Install Quill with Claude Code

Anthropic's official terminal coding assistant.

## Prerequisites

- [Claude Code](https://claude.com/code) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent claude-code
```

## Run onboarding

```bash
claude
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
