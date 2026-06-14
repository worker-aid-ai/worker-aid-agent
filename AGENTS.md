# AGENTS.md

## Project context

This repository implements Worker Aid Agent, an open-source AI agent/skill project for Chinese workers' rights self-help and legal-aid preparation.

## Coding rules

- Keep core CLI dependency-free unless there is a strong reason.
- All legal outputs must include uncertainty and human-review reminders.
- Do not add content that fabricates evidence, promises results, or impersonates legal professionals.
- Public examples must be fully anonymized.
- Prefer structured JSON/Markdown outputs.

## Content rules

- Cite official sources where possible when adding law or policy content.
- Mark local-policy content with province/city and update date.
- Use cautious wording for contested or jurisdiction-specific issues.
