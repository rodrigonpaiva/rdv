# Task package and handoff template

Copy the package into the task's coordination entry before implementation. Keep the coordinator as the only integration owner. Use explicit `not applicable` or `not executed — reason` entries instead of leaving relevant fields ambiguous. References identify source sections and acceptance criteria; copying the specifications does not replace reading them.

## Before implementation

```text
Task: BK-xxx — title
Status: ready / in progress / in review / done / blocked
Integration owner and construction role:
Reviewer and independence (or unassigned; author checks only):
Branch/worktree, base commit and preexisting changes:
Verified dependencies and evidence links:

Observable objective:
Acceptance criteria and how each will be demonstrated:
Sources and sections (English planning editions, declared versions, ADRs):
RF/CA/wireframes (or cross-cutting enabler; no dedicated view):
Relevant I01–I15 invariants (or no domain change):

Owned files/directories and any other writers:
Inputs, outputs, errors and version:
Trusted actor/tenant/capability resolution (or not applicable):
Shared contracts, consumers and migration order:
Data/environment destination and synthetic fixtures:
Limits and excluded work:
External actions already authorized by the user:
Human/product/provider decisions required before activation:

Positive, negative, boundary and recovery scenarios:
Proportional checks (exact commands, prerequisites and expected result):
Evidence location and sanitization:
Stop/block conditions, independent work available and next owner:
```

An objective is observable behavior or a concrete artifact, not “implement the backend.” Do not claim a planned endpoint, template, provider or parameter is implemented merely because it appears in a source. Unknown external conditions block activation of that capability; continue independent authorized construction. Escalate material money/authorization/policy conflicts instead of inventing a resolution.

## Before handoff

```text
Task and proposed status:
Branch/worktree and base; commit/PR if actually created:
Objective and acceptance criteria met (criterion → implementation → evidence):
Changed files, public contracts, consumers and migrations:
Commands executed with runtime, environment, result and report links:
Checks not executed and why:
Findings corrected and remaining risks/limits:
Independent review result (or pending; no independent acceptance claimed):
External actions performed under which authorization:
Impact on other owners, blocker and next step:
```

Never remove or weaken constraints, tests, engines, authorization or evaluation to make a check pass. Do not invent prices, policy, legal approval, provider capability, passed tests or independent approval. Log/report IDs and synthetic values, not secrets, personal data or full payment/conversation content. An unexecuted check must remain labeled unexecuted.

For a low-risk comment/documentation task, select focused checks and inspect the diff. For domain, authorization, persistence or integration changes, use AGENTS section 10's required risk-specific proof. Broad green foundation checks do not demonstrate future business guarantees.
