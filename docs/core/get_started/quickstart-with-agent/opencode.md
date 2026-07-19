---
sidebar_label: OpenCode
---

# Install Quill with OpenCode

SST's open-source coding agent.

## Prerequisites

- [OpenCode](https://opencode.ai) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent opencode
```

## Run onboarding

```bash
opencode
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
