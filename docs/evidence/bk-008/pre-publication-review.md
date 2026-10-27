# BK-008 pre-publication review

Review date: 2026-10-27. Reviewer/integration owner: root (author review; independent acceptance remains pending). Branch: `feat/bk-008-design-system`; base: `c0b8380`. The user explicitly authorized review and, if no blocking problems remained, commit and push. Merge and deployment are outside this authorization.

## Scope and task package supplement

The [coordination entry](../../planning/coordination.md#bk-008--ds-20-tokens-and-basic-components), [criterion matrix](README.md) and [public component contract](../../../packages/ui/README.md) record ownership, dependencies, sources, objective and observable acceptance. This supplement completes the solo task/handoff fields:

- Inputs/outputs/errors/version: typed UI props and rendered native elements, labels, local loading/error presentation and controlled callbacks; initial internal package version 0.0.0. Consumers are the web foundation and development demonstration. No HTTP/event contract or migration.
- Trusted actor/tenant/capability: not applicable; presentation grants no domain authority. I01–I15 business invariants are unchanged; no domain operation is introduced.
- Destination/fixtures: task-owned loopback Next servers and synthetic local demonstration state only. No provider, customer, production data or external mutation.
- Scenarios: five viewport boundaries, dark-host light theme, doubled text, native labels/required/error descriptions, prevented loading clicks, retained input after error, modal initial focus, wrapping, Escape, busy dismissal guard and focus return. Production must exclude the development route. Evidence uses local assets and sanitized test content only.
- Activation dependencies: none for local UI construction; actual booking/payment/permission outcomes require future validated backend consumers. Stop conditions are business-rule conflicts, unintended production simulation routes or failed checks; independent documentation work remains possible.
- Excluded work: backend/domain/schema, providers, complete business journeys, Figma publication, merge, deployment and next BK.

## Finding and correction

The modal closed unintentionally when first mounted with `open=true` in React Strict Mode. Effect cleanup queued a native close event; the second effect setup reopened the element, but the stale event still requested controlled dismissal. The browser reproduction returned `state=closed, modal=false` before the fix.

The close handler now ignores that queued event when the native dialog is already open. [Reproduction](strict-mode-review.mjs), run from the isolated temporary Playwright client, now verifies the modal remains open and Escape still closes it and updates controlled state. This script creates and removes a temporary review route; it is a manual evidence utility, not a project CI gate.

The full existing browser probe passed again after the fix: five widths, keyboard containment and return, loading/error recovery, local fonts, light theme and text resizing. [Post-fix browser report](review-after-fix.json). Production build and clean verification are recorded in the task evidence. No unrelated source changes or dependency upgrades were introduced during review.

## Handoff

No blocking findings remain after the correction and recorded checks. This is author review, not independent QA approval. Screen-reader/mobile virtual-keyboard and broader browser coverage remain not executed as documented in the [evidence limits](README.md). Remote CI is not claimed. Scoped commit/push is authorized by the user's current request; Git history identifies the resulting commit.

Final commands with Node 24.22.1/npm 12.2.1: `npm run build:packages`, temporary Strict Mode reproduction, complete browser probe, `npm run build`, and `npm run verify:clean -- bk-008` all passed. [Final clean report](clean-verification-78faf986-b3f2-40fd-b0b6-8355f5a2f30e.json) records offline installation, lint, 47 tests, integrated checks, smoke and all-workspace types. Byte comparison found no source differences under apps/packages/scripts/database between the successful clean copy and the final working source. Existing locked dependency versions are unchanged. [Post-fix production probe](production-after-fix.json) passed root/skip-link, internal route 404 and manifest absence, asset inventory and contrast checks using that clean build. Task-owned servers and temporary route were removed; production build restored generated type references. Final staged whitespace and file-scope checks precede the commit.
