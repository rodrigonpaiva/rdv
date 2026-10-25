# P2 — Verification source link isolation

Date: October 25, 2026. Branch: `fix/bk-006-foundation-audit`, base `6c85c45`. Status: implemented and author-verified; independent acceptance not claimed. Existing uncommitted corrections were preserved. No commit, push, merge or deployment performed.

## Reproduced defect and correction

Before this correction, `copyVerificationSources` excluded `.env.local` by name but preserved an included `.env.example` symbolic link to that file. The temporary copy could still read the excluded original. The reproduction used only synthetic data; no real environment content was read or logged.

The helper now checks each included entry with `lstatSync` and rejects symbolic links before copying them. This intentionally rejects internal, external, directory and dangling links, avoiding both external access and a silently incomplete source copy. Regular files/directories and regular `.env.example` templates remain supported. Excluded dotenv/build/node_modules entries are skipped without following targets. Source targets are not changed.

A real filesystem regression covers `.env.example -> .env.local`, an external file, an external directory, an internal source file and a dangling target. Each case fails explicitly before the link is copied and preserves the source. The existing positive fixture verifies regular sources/templates and excluded dotenv links.

## Executed verification

Exact runtime: Node 24.22.1/npm 12.2.1, existing TypeScript 6.0.3.

- `npm run lint`: passed.
- `npm run test:ci`: 8/8 passed, including the new five-scenario source-copy regression.
- `npm run verify:clean`: passed offline installation, lint, 8 CI tests, 10 boundary tests, 7 contract tests, 18 configuration tests, 3 clock/CLI tests, full build, real local API/worker/web smoke, secret canaries and all-workspace types. Lock unchanged. [New report](source-link-isolation-clean-verification.json); historical reports were not overwritten.
- `git diff --check`: passed.

Not executed: PostgreSQL rerun (no SQL, migration, role, database helper or database test changes; the immediately preceding audit already reproduced it), exact committed-snapshot artifact pipeline or remote CI (the checkout contains preexisting uncommitted work), independent review or deployment. This change concerns verification copying only; it introduces no domain/API/dependency changes.

Changed surfaces: source-copy helper and regression, root/CI instructions, coordination and this separate evidence record. Next owner: reviewer/coordinator for integration of the current correction slice.
