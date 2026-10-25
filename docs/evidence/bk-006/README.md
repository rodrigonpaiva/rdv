# BK-006 — Quality CI and versioned artifacts evidence

Date: October 25, 2026. Status: independently reviewed and accepted for publication; GitHub execution pending. See [review](review.md). Branch: `feat/bk-006-quality-ci`. Base: `3d693d0`. No commit/push in the task checkout, merge, deployment or branch-protection change performed. Commits used for local pipeline proof exist only in a temporary verification repository.

## Delivered behavior

The GitHub workflow installs the exact Node/npm toolchain and lockfile, runs lint/types/applicable unit/contract/database/build checks without production credentials, packages only after success, and uploads immutable bundles named with commit/run/attempt. Build files and versioned SQL match the receipt's commit, source hashes and lock hash. Every copied file has a SHA256 entry; the archive has an outer checksum. Cache, local secrets and local planning sources are excluded. See [scope and decisions](../../planning/bk-006-ci.md) and [commands](../../../scripts/ci/README.md).

| Criterion | Local evidence | Remaining evidence |
| --- | --- | --- |
| CI runs applicable lint/types/tests/database/build | Clean offline install, lint, 3 CI tests, 9 boundary tests, 7 contract tests, 18 config tests, 2 clock/target tests, build, smoke/canaries, all workspace types and real PostgreSQL passed | Actual Ubuntu GitHub workflow run |
| Failed check blocks artifact promotion | Real lint regression on a temporary test branch failed `ci:quality`; old receipt/bundle removed; later gates not run; artifact absent. Tests cover every failed gate | GitHub failed run with package/upload skipped and no artifact |
| Artifact and migrations match commit/lock | Full local command passed; archive's 230 payload file hashes verified independently using Python/tarfile; manifest identifies snapshot commit and lock; stale commit/lock/SQL/output/gate probes rejected | Verify downloaded GitHub artifact and final published task commit |

## Executed commands

- Restored Node 24.22.1 under `/tmp`, validated official SHA256; installed npm 12.2.1 in an isolated prefix. No global toolchain replacement.
- Inspected package registry metadata and installed exact ESLint 10.13.0, @eslint/js 10.0.1, typescript-eslint 8.72.0 and globals 17.13.0. No preexisting locked dependency changed version. TypeScript remains 6.0.3.
- `npm run lint` and `npm run test:ci`: passed.
- `npm run verify:clean -- bk-006 --database`: passed all stages, lock unchanged; [report](clean-verification.json).
- `npm run ci:quality` followed by `npm run ci:artifact` in a committed temporary source snapshot: passed. Repeated after removing all compiled outputs to prove actual fresh gate ordering: passed. [Summary](local-pipeline.json), [first log](quality.txt), [fresh log](fresh-quality.txt).
- Controlled lint failure committed on a dedicated branch in that temporary repository: expected nonzero exit, no receipt/artifact and no later gates. Returned temporary checkout to its success branch. [Failure log](controlled-failure.txt).
- Independently read every archived payload file and compared SHA256 with the manifest: all 230 matched, including migration SQL and migration lock.
- Workflow YAML parsed with js-yaml; reviewed normal success-only sequencing, read-only permissions and SHA-pinned actions. Corrected hidden upload handling with `include-hidden-files: true`, restricted to the explicit archive/checksum patterns. Official pinned upload action documentation confirms this requirement.
- `git diff --check`: passed.

## Environment findings and limitations

The initial offline installation failed because the cache was incomplete after the host restart. A normal locked `npm ci` populated it; the subsequent clean offline run passed. Sandbox network/loopback/Docker restrictions required approved execution outside the sandbox. Docker Desktop was started for disposable tests; tests removed their containers. npm reports Prisma lifecycle scripts blocked under npm 12; migrations still executed successfully with the pinned Prisma engine. No bypass flags were added.

Not executed: GitHub workflow success/failure runs, remote artifact download, production/staging deployment, business/provider/AI scenarios not yet implemented. The user explicitly authorized independent review and commit/push of implementation/test branches on October 25, 2026. Local results are not represented as remote CI acceptance. BK-006 remains open until required pipeline evidence and review are recorded.
