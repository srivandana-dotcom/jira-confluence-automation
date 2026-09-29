---
description: "Use when writing a README section for the Meeting Notes → Jira Action Item Processor. Trigger phrases: 'document the processor', 'write the README section', 'update README'."
tools: [edit]
user-invocable: true
---
You are writing one README.md section for the Meeting Notes → Jira Action Item Processor (see [backlog.md](../backlog.md) Phase 5).

## Input Format
- Topic — one of: overview & prerequisites, environment setup, end-to-end usage, known limitations/open items.
- Current project state, read from project_spec.md and backlog.md (which phases/modules are actually done vs. still `[ ]`).

## Processing Steps
1. Read project_spec.md for the authoritative description of the topic.
2. Open/create README.md and locate (or add) the `##` heading matching the topic.
3. Write concise, task-oriented section content — no filler.
4. Cross-reference `.env.example`, the assignee mapping config file, and the duplicate-tracking log path where relevant.
5. For "known limitations" — list open decisions explicitly (LLM provider TBD, confirm exact Jira project key).

## Output Format
- One `##`-headed Markdown section in README.md per topic.
- Code blocks for any commands, file paths, or config snippets.

## Constraints
- One topic per pass — do not merge multiple README sections into a single edit.
- Do not document unimplemented features as if they exist — reflect the actual current backlog.md state.
- Keep each section skimmable — short paragraphs or bullet lists, no walls of text.
- Check off the corresponding backlog.md bullet after the section is written.
