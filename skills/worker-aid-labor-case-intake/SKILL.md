---
name: worker-aid-labor-case-intake
description: Use when a worker describes a labor dispute in natural language and the facts, dispute type, timeline, claims, or missing information need to be structured before legal-aid preparation
---

# Labor Case Intake

## Overview

Turn a worker's informal description into structured case facts for review. Do not jump to legal conclusions, predict outcomes, or ask for unnecessary sensitive data.

## When to Use

- Initial intake for wage arrears, overtime pay, unsigned contract, termination, social insurance, work injury, or related disputes.
- The user has mixed facts, dates, claims, and evidence in one narrative.
- A later skill needs clean facts, a timeline, or missing-information questions.

## Inputs

- User's natural-language description.
- Optional anonymized summaries of contracts, payroll, attendance, chat records, notices, or bank transfers.

## Output

```json
{
  "basicFacts": {
    "city": "",
    "employerName": "",
    "startDate": "",
    "endDate": "",
    "position": "",
    "monthlySalary": "",
    "contractStatus": ""
  },
  "disputeTypes": [],
  "timeline": [],
  "claimsToClarify": [],
  "missingFacts": [],
  "urgentRisks": [],
  "nextQuestions": []
}
```

## Workflow

1. Identify city, work location, start date, end date or current status, position, wage basis, contract status, social insurance, and termination status.
2. Classify dispute types without making final legal judgments.
3. Build a dated timeline from known facts and label uncertain dates.
4. List missing facts, urgent risks, and the next questions needed for human review.

## Guardrails

- Do not request full ID numbers, complete phone numbers, exact home addresses, bank card numbers, or unredacted files in public contexts.
- Include uncertainty and human-review reminders for limitation periods, amounts, jurisdiction, local policy, and claim strategy.
- Never fabricate facts, evidence, statutes, professional identity, or expected results.

## Official References

- Prefer current official sources listed in `docs/LEGAL_BASIS.md` and `docs/DATA_SOURCES.md`.
- For national law and policy checks, start with the National Laws and Regulations Database, China Government website, Ministry of Human Resources and Social Security channels, 12333, and 12348.
