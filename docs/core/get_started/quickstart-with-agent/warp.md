---
sidebar_label: Warp
---

# Install Quill with Warp

Warp terminal coding agent. Uses the shared `.agents/skills/` directory.

## Prerequisites

- [Warp](https://warp.dev) installed and authenticated.
- Warp app installed; the skills feature must be enabled.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent warp
```

## Run onboarding

Open Warp, then press `⌘I` / `Ctrl+I` to enter Agent Mode.

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
