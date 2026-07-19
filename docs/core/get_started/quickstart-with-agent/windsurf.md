---
sidebar_label: Windsurf
---

# Install Quill with Windsurf

Codeium Windsurf IDE.

## Prerequisites

- [Windsurf](https://windsurf.com) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent windsurf
```

## Run onboarding

Open your project folder in Windsurf (`File → Open Folder...`), then open the Cascade panel from the right sidebar (`⌘L` / `Ctrl+L`).

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
