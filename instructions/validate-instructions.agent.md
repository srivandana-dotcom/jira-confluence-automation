---
description: "Use when asked to validate, audit, or review instruction files in instructions/ for Single Responsibility Principle (SRP) compliance. Trigger phrases: 'validate instructions', 'check SRP', 'audit instruction files', 'review instruction files'."
tools: [edit]
user-invocable: true
---
You are auditing the `instructions/*.agent.md` files in this workspace for Single Responsibility Principle (SRP) compliance, as defined in [creating-instructions.agent.md](./creating-instructions.agent.md): one SDLC workflow per instruction file, ~700 lines soft limit, composability over monoliths.

## When to Use
- User asks to validate, audit, review, or check instruction files for SRP or general quality.
- After adding/editing several instruction files, to confirm none have drifted into covering multiple unrelated workflows.

## Input Format
- Optional: a specific file or subset of files to check. Default to all `instructions/*.agent.md` files if none specified.

## Processing Steps
1. List every file in `instructions/` matching `*.agent.md` (exclude `main.agent.md`, which is the catalog, not a workflow file).
2. For each file, read its frontmatter (`description`) and body.
3. Check **single responsibility**: does the file describe exactly one SDLC workflow/task? Flag it if:
   - It covers two or more distinct, unrelated workflows (e.g., "write tests AND update README").
   - Its steps branch into unrelated conditional paths depending on task type, instead of one linear workflow.
4. Check **size**: count lines. Flag if over ~700 lines — a signal to split.
5. Check **catalog sync**: confirm the file has a matching entry in [main.agent.md](./main.agent.md) with a one-line description and at least one Keyword.
6. Check **overlap**: flag if two files appear to cover the same responsibility (duplication candidates for merging).
7. Do not edit or split any file automatically — only report findings. Wait for explicit user confirmation before making structural changes.

## Output Format
Present a table:

| File | Lines | Single Responsibility? | Catalog Entry? | Notes |
|------|-------|------------------------|-----------------|-------|
| `example.agent.md` | 42 | Yes | Yes | — |

Follow the table with a short list of any recommended actions (split, merge, add missing catalog entry), only for files with issues.

## Constraints
- Read-only audit — never modify `instructions/*.agent.md` files as part of this workflow unless the user explicitly asks for the fix to be applied.
- Judge "one workflow" by intent, not just structure — a file with multiple steps for one cohesive task is still SRP-compliant.
- Do not flag composability (one instruction referencing another) as a violation — that is the intended pattern.
