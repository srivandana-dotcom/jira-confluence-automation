# Module 10 Completion Report

## Instruction Files
```
    Directory: C:\Workspace\hello-genai\instructions


Mode                 LastWriteTime         Length Name                         
----                 -------------         ------ ----                         
-a----        29-09-2026     11:44           1312 create-status-report.agent.md
-a----        29-09-2026     12:46          16994 creating-instructions.agent.m
                                                  d                            
-a----        29-09-2026     13:01           1633 document-processor-readme.age
                                                  nt.md                        
-a----        29-09-2026     13:01           2511 implement-processor-module.ag
                                                  ent.md                       
-a----        29-09-2026     13:01           1671 main.agent.md                
-a----        29-09-2026     13:01           1930 test-processor-module.agent.m
                                                  d                            
```

## main.agent.md Contents
```markdown
---
description: "Index of custom agent/instruction files in this workspace."
user-invocable: false
---
# Instruction Files Index

- [create-status-report.agent.md](./create-status-report.agent.md) — Generates weekly status reports (Markdown, Accomplishments/Blockers/Next Week sections, bullet points only, max 20 lines, professional tone, no fluff words).
  + Keywords: status report, weekly status, status update, sprint status
- [creating-instructions.agent.md](./creating-instructions.agent.md) — How to create/update instruction files, skills, and IDE-specific prompt wrappers in this project.
  + Keywords: create instruction, new instruction, add skill, instruction catalog, bootstrap instructions
- [implement-processor-module.agent.md](./implement-processor-module.agent.md) — Implements one core module (transcript_loader, action_item_extractor, assignee_resolver, duplicate_tracker, review_cli, jira_client) of the Meeting Notes → Jira Action Item Processor.
  + Keywords: implement module, build the module, wire the processor, transcript_loader, assignee_resolver, jira_client
- [test-processor-module.agent.md](./test-processor-module.agent.md) — Writes unit tests for one core module of the Meeting Notes → Jira Action Item Processor, covering the scenarios listed in backlog.md.
  + Keywords: write tests, unit test, cover the scenarios, test module
- [document-processor-readme.agent.md](./document-processor-readme.agent.md) — Writes one README.md section (overview, setup, usage, limitations) for the Meeting Notes → Jira Action Item Processor.
  + Keywords: document the processor, write README section, update README
```

## Sample Instruction
- File: instructions/implement-processor-module.agent.md
- Contents:
```markdown
---
description: "Use when implementing a core module (transcript_loader, action_item_extractor, assignee_resolver, duplicate_tracker, review_cli, jira_client) for the Meeting Notes → Jira Action Item Processor. Trigger phrases: 'implement <module>', 'build the module', 'wire the processor'."
tools: [edit]
user-invocable: true
---
You are implementing one core module of the Meeting Notes → Jira Action Item Processor (see [project_spec.md](../project_spec.md) and [backlog.md](../backlog.md)).

## Input Format
- Module name — one of: `transcript_loader`, `action_item_extractor`, `assignee_resolver`, `duplicate_tracker`, `review_cli`, `jira_client`.
- Module responsibility — taken verbatim from the matching backlog.md bullet (Phase 2 or Phase 3).
- Relevant data model fields from project_spec.md: `task_summary`, `owner_name`, `due_date`, `assignee_account_id`.

## Processing Steps
1. Read project_spec.md and backlog.md to confirm the module's responsibility and its interface boundary with adjacent modules.
2. Create/open the module file under the project's module layout (e.g. `transcript_loader.py`).
3. Define the module's public function(s)/class with inputs/outputs matching the data model fields above.
4. `action_item_extractor` — implement behind a pluggable interface; build the mock implementation first, real LLM provider later (Phase 3).
5. `assignee_resolver` — look up `owner_name` in the assignee mapping config; flag unmatched names in the return value, never raise on a miss.
6. `duplicate_tracker` — key check/record operations by transcript source + normalized item text.
7. `jira_client` — wrap Jira REST API v3 calls; target the `VER-IOT` project, `Task` issue type, backlog (no sprint).
8. Wire the module into the end-to-end flow only after its own function is validated in isolation.

## Output Format
- One module file, one function/class per responsibility, with a docstring describing inputs/outputs.
- Check off the corresponding backlog.md bullet once the module compiles and matches its responsibility.

## Constraints
- Never hardcode Jira credentials — read them from `.env` via `python-dotenv`.
- Keep business logic free of buried I/O side effects where avoidable, so it stays independently testable.
- Match module/function naming exactly as written in backlog.md so tests and wiring code import consistently.
- Do not fold Phase 3 integration logic (real Jira client, real LLM) into a Phase 2 mock implementation.
```
