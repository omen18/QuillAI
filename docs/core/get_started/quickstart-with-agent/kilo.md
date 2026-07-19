---
sidebar_label: Kilo Code
---

# Install Quill with Kilo Code

VS Code coding agent (fork of Roo Code).

## Prerequisites

- [Kilo Code](https://kilocode.ai) installed and authenticated.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent kilo
```

## Run onboarding

Open your project folder in VS Code with the Kilo Code extension installed, then click the Kilo icon in the Activity Bar. Or use the CLI:

```bash
kilo
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
