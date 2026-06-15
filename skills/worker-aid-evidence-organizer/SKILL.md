---
name: worker-aid-evidence-organizer
description: Use when labor-dispute evidence, screenshots, payroll records, attendance records, notices, recordings, or chat logs need to be cataloged for labor inspection, arbitration, legal aid, or lawyer review
---

# Evidence Organizer

## Overview

Organize only existing, user-provided evidence into a reviewable evidence index. Mark reliability risks and preservation needs instead of suggesting edits, reconstruction, or fabrication.

## When to Use

- The user has scattered documents, screenshots, messages, payroll records, attendance records, audio, notices, or medical/work-injury materials.
- A complaint, arbitration application, or legal-aid consultation needs an evidence table.
- Evidence authenticity, original carrier, or proof purpose needs to be clarified.

## Output

```markdown
| 编号 | 证据名称 | 证明目的 | 来源/载体 | 是否原件 | 风险 |
|---|---|---|---|---|---|
```

## Evidence Categories

1. Labor relationship evidence.
2. Wage payment evidence.
3. Attendance and overtime evidence.
4. Termination, resignation, layoff, or negotiation evidence.
5. Demand, complaint, and settlement communication evidence.
6. Medical, work-injury, and social-insurance evidence.
7. Other corroborating evidence.

## Guardrails

- Use cautious wording such as "may support" or "can help show"; do not claim evidence will be accepted.
- Mark "screenshot only, original missing" as a risk.
- For audio, chat records, emails, and electronic data, remind the user to preserve original devices, accounts, files, metadata, and export paths where lawful.
- Do not advise altering chat records, backfilling attendance, creating false documents, or inducing testimony.
- Include a human-review reminder before submission.

## Official References

- Check submission and evidence-format requirements through the local labor arbitration commission, court guidance, labor inspection channel, or 12348 before filing.
