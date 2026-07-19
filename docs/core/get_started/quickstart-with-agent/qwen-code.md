---
sidebar_label: Qwen Code
---

# Install Quill with Qwen Code

Alibaba Qwen Code CLI.

## Prerequisites

- [Qwen Code](https://qwenlm.github.io/qwen-code-docs) installed and authenticated.
- Qwen API access required.

## Install Quill skills

```bash
npx skills add omen18/QuillAI --agent qwen-code
```

## Run onboarding

```bash
qwen
```

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
