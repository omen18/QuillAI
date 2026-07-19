---
name: quill
description: "Quill CLI for AI agents — a semantic SQL layer over 22+ databases (Postgres, MySQL, BigQuery, Snowflake, Spark, …). The actual workflow guides live inside the `quill` CLI itself; this is just a discovery stub. Use whenever the user asks a data question (how many, show me, top N, compare, trend, breakdown, metric, revenue, customers, orders), wants to install / set up Quill Engine, connect a new database, connect SaaS data via dlt (HubSpot, Stripe, Salesforce, GitHub, Slack), generate or regenerate an MDL project from a database schema, enrich a project with business context (enum meanings, units, cubes like ARR / DAU / churn), or turn a project's context layer into a shareable GenBI web app / dashboard and deploy it to Vercel or Cloudflare. Triggers: 'install quill', 'set up quill engine', 'connect database to quill', 'connect SaaS to quill', 'load hubspot / stripe / salesforce data', 'generate mdl', 'scaffold quill project', 'enrich quill context', 'augment my project', 'add cubes', 'build a dashboard', 'make a shareable analytics app', 'deploy my context layer as a web app', 'genbi app', 'quill onboarding', 'quill usage', 'quill generate mdl', 'quill dlt connector', 'quill enrich context', 'quill genbi'."
license: Apache-2.0
allowed-tools: Bash(quill:*)
---

# Quill CLI

This is a discovery stub. The actual workflow guides and prompt helpers
live inside the `quill` CLI itself, so they always match the installed
quill version (no skill cache, no version drift).

Install: `pip install quill`.

## Workflow guides

```bash
quill skills list                        # all available workflow guides
quill skills get onboarding              # set up Quill end-to-end
quill skills get usage                   # day-to-day querying
quill skills get generate-mdl            # generate MDL from a database schema
quill skills get dlt-connector           # connect SaaS sources via dlt
quill skills get enrich-context          # add business context (units, enums, cubes)
quill skills get genbi                   # build & deploy a shareable GenBI web app
# add --full to include the skill's reference docs
# add --script <name> to fetch a bundled script (e.g. dlt-connector / introspect_dlt)
```

## Reference docs

Full reference docs live on the web: <https://github.com/omen18/Quill/tree/main/docs/core>

```bash
quill docs connection-info <ds>          # required + optional connection fields for a data source
```

## Prompt enhancement (wraps a user question for an agent)

```bash
quill ask "<question>" --guided          # for weaker LLMs (strict task flow)
quill ask "<question>" --direct          # for stronger LLMs (minimal wrapping)
```

## Day-to-day data commands (not a sub-app — top-level)

```bash
quill --sql '...'                        # execute SQL through the MDL layer
quill query --sql '...'                  # same, explicit
quill dry-plan --sql '...'               # transpile only, no DB hit
quill context show / build / validate    # project / MDL lifecycle
quill profile add / list / switch        # named connection profiles
quill memory index / recall / store      # semantic memory (needs `[memory]` extra)
```

Run `quill --help` for the full surface; load the matching `quill skills get
<name>` guide before driving any multi-step workflow.
