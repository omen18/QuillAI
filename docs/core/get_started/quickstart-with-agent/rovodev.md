---
sidebar_label: Rovo Dev
---

# Install Quill with Rovo Dev

Atlassian Rovo Dev.

## Prerequisites

- [Rovo Dev](https://www.atlassian.com/software/rovo) installed and authenticated.
- An Atlassian account is required.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent rovodev
```

## Run onboarding

```bash
acli rovodev run
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
