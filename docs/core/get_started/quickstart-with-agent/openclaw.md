---
sidebar_label: OpenClaw
---

# Install Quill with OpenClaw

OpenClaw coding agent.

## Prerequisites

- [OpenClaw](https://openclaw.ai) installed and authenticated.
- Project-scope skills are installed under repo-root `skills/`, **not** under a hidden `.openclaw/` directory.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent openclaw
```

## Run onboarding

```bash
openclaw
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
