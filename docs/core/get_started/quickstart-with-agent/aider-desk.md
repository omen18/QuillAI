---
sidebar_label: AiderDesk
---

# Install Quill with AiderDesk

A desktop UI for the Aider coding agent.

## Prerequisites

- [AiderDesk](https://github.com/hotovo/aider-desk) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent aider-desk
```

## Run onboarding

Launch the AiderDesk app, then `File → Open Folder...` to open your project and start a new chat.

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
