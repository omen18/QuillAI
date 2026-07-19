# Quill Engine — Agent Skills

The actual workflow guides, reference docs, and prompt helpers live **inside
the `quill` CLI itself**, so they always match the installed quill
version (no skill cache, no version drift).

This directory ships a single discovery stub ([`quill/SKILL.md`](quill/SKILL.md))
that an AI client can install. Once the agent reads the stub, it learns to
fetch everything else from the CLI on demand:

```bash
quill skills list                        # all available workflow guides
quill skills get <name>                  # fetch a guide
quill skills get <name> --full           # include the guide's reference docs
quill skills get <name> --script <s>     # fetch a bundled script

quill docs connection-info <ds>          # connection fields for a data source

quill ask "<question>" --guided          # wrap a question for a weaker LLM
quill ask "<question>" --direct          # wrap a question for a stronger LLM
```

## Install

```bash
pip install quill                 # the CLI (everything is here)
npx skills add omen18/Quill            # install the discovery stub for AI clients
```

Or via Claude Code's plugin marketplace:

```text
/plugin marketplace add omen18/Quill --path skills
/plugin install quill@quill
```

## Writing a new skill

New skill guides ship as Python package data in
[`core/quill/src/quill/skills_content/<name>/`](../core/quill/src/quill/skills_content/),
not as a new directory under this `skills/` tree. See
[`AUTHORING.md`](AUTHORING.md).
