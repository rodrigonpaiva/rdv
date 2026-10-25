# BK-006 — Quality CI and versioned artifacts

Sources: English backlog v1.0, BK-006; technical specification v1.0 sections 20–21 and 23; functional specification v1.0; design system v2.0. Dependencies BK-004 and BK-005 are independently accepted. This is a cross-cutting engineering enabler without a dedicated wireframe or new business behavior.

## Decisions

Use GitHub Actions because the existing origin is GitHub. Run on Ubuntu 24.04, with the existing exact Node 24.22.1/npm 12.2.1 pins and `npm ci`. Pin third-party actions to verified commit SHAs. Use only `contents: read`, no persisted checkout credentials, no production secrets, and no deployment environment. Pull requests execute with the same restricted workflow; do not use `pull_request_target`.

Introduce ESLint 10.13.0, @eslint/js 10.0.1, typescript-eslint 8.72.0 and globals 17.13.0 as exact development pins. The parser's published TypeScript range includes the repository's 6.0.3. Recommended JS/TS correctness rules apply to source/config/scripts, excluding generated code and outputs. A leading underscore explicitly marks intentionally unused handler parameters; this preserves the validated Nest query parameter. Formatting is outside this task.

`ci:quality` requires a clean committed checkout, invalidates previous local artifact evidence, and runs lint, types, CI regression tests, integrated contracts/boundaries/build/unit/HTTP/smoke/secret checks and disposable real PostgreSQL tests. A nonzero exit or signal stops execution. Only success writes a receipt containing all gate names, exact commit, lock hash, source hashes and build/migration hashes. No filtering by changed paths weakens these foundation gates.

`ci:artifact` checks the receipt against current committed sources and exact build files before copying. The tarball carries a manifest with SHA256 for each included file, plus an outer checksum. Outputs include web/API/worker and shared packages, canonical OpenAPI, versioned migrations/schema/config, workspace manifests and the lockfile. Cache, local secrets, local plans and Git metadata are excluded. An upload step with normal success semantics runs only after verification and packaging. Artifacts are immutable per workflow run/attempt, retained for 14 days.

These are verified build bundles, not deployable container images. BK-090 owns runtime dependency installation, images, infrastructure, staging E2E, deployment and promotion between environments. No provider/AI evaluation suite exists yet; future affected slices must extend the gates. Branch protection is an administrative policy outside this implementation; the workflow blocks its own artifact upload, not an administrator's ability to merge.

## Acceptance evidence

1. Run clean locked installation, lint, applicable tests, database integration, build and types locally; then run the actual GitHub workflow.
2. Introduce an unused variable on a dedicated test branch. Confirm lint fails, receipt/package/upload do not execute, and the failed run has no artifact. Keep the successful task branch unchanged.
3. Inspect the successful bundle manifest and checksums; compare commit, lock, migration and output hashes. Confirm stale commit, lock, SQL and output probes are rejected.

Local tests are useful evidence but do not substitute for the required remote pipeline runs. Remote publication and branch manipulation require user authorization after the changes are reviewable.

## References

- [ESLint flat configuration](https://eslint.org/docs/latest/use/configure/configuration-files)
- [TypeScript ESLint supported dependency versions](https://typescript-eslint.io/users/dependency-versions)
- [GitHub immutable artifact action](https://github.com/actions/upload-artifact)
- [GitHub job/step success conditions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions#status-check-functions)
