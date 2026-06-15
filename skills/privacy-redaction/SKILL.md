---
name: privacy-redaction
description: Use when worker case details, examples, issues, screenshots, contracts, chat records, payroll records, or public contributions may contain personal, employer, medical, bank, address, or account identifiers
---

# Privacy Redaction

## Overview

Redact sensitive information before public questions, issues, examples, or case contributions. Preserve legally useful context while removing identifiers that can expose the worker, employer staff, witnesses, or account data.

## Redaction Rules

- Name: 张三 -> 劳动者A.
- Phone: 13800138000 -> 138****8000.
- ID number: 4403xxxxxxxxxxxx -> 4403************.
- Employer: 深圳市某某科技有限公司 -> 深圳某科技公司.
- Address: keep province/city/district if needed; remove street number, room, and exact location.
- Bank card, medical record number, account ID, contract number, internal file number: hide by default.

## Output

- Redacted text.
- Residual sensitive-information checklist.
- List of content that should not be posted publicly.
- Note on whether enough location/time context remains for legal or policy review.

## Guardrails

- Do not invent replacement facts that change the legal meaning.
- For examples and public datasets, ensure cases are fully anonymized.
- When unsure, prefer masking more detail and ask the user to keep originals offline for professional review.
