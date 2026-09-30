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
- [calculate-compound-interest.agent.md](./calculate-compound-interest.agent.md) — Runs `tools/compound_interest.py` to answer compound interest / future value questions and formats the result.
  + Keywords: compound interest, calculate interest, future value of an investment
- [use-transcript_loader.agent.md](./use-transcript_loader.agent.md) — Runs `tools/transcript_loader.py` to read/retrieve and display a transcript file from a given path.
  + Keywords: load transcript, read the transcript file, show me the transcript
- [validate-instructions.agent.md](./validate-instructions.agent.md) — Audits `instructions/*.agent.md` files for Single Responsibility Principle compliance (one workflow per file, size, catalog sync).
  + Keywords: validate instructions, check SRP, audit instruction files, review instruction files
