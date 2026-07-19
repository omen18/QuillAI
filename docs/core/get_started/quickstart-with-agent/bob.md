---
sidebar_label: IBM Bob
---

# Install Quill with IBM Bob

IBM watsonx coding agent.

## Prerequisites

- [IBM Bob](https://www.ibm.com/watsonx) installed and authenticated.
- IBM Cloud account required.

## Install Quill skills

```bash
npx skills add omen18/Quill --agent bob
```

## Run onboarding

Open your project folder in IBM Bob (watsonx Code Assistant), then start a new chat.

Then ask:

```text
Use the /quill skill to install and set up Quill.
```

The skill walks the agent through environment checks, profile creation, project scaffolding, and a first query.

## Next step

- [Quickstart with sample data](../quickstart) — walk through `jaffle_shop` end-to-end
- [Connect your data](/oss/guides/connect) — point Quill at a real database
