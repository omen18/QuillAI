---
sidebar_label: OpenHands
---

# Install Quill with OpenHands

All-Hands open-source coding agent.

## Prerequisites

- [OpenHands](https://docs.openhands.ai) installed and authenticated.
- A Docker runtime is typically required.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent openhands
```

## Run onboarding

```bash
openhands
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
