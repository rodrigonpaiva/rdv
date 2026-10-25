# BK-006 — Quality CI and versioned artifacts evidence

Date: October 25, 2026. Status: complete for the BK-006 scope; independent implementation and remote gate review accepted. See [review](review.md). Branch: `feat/bk-006-quality-ci`. Base: `3d693d0`. Implementation commit: `57248ae8af969b55d45075683a671e6ddcf53077`, published with user authorization. The controlled-failure test branch is separate. No merge, deployment or branch-protection change performed. Earlier local proof commits exist only in a temporary verification repository.

## Delivered behavior

The GitHub workflow installs the exact Node/npm toolchain and lockfile, runs lint/types/applicable unit/contract/database/build checks without production credentials, packages only after success, and uploads immutable bundles named with commit/run/attempt. Build files and versioned SQL match the receipt's commit, source hashes and lock hash. Every copied file has a SHA256 entry; the archive has an outer checksum. Cache, local secrets and local planning sources are excluded. See [scope and decisions](../../planning/bk-006-ci.md) and [commands](../../../scripts/ci/README.md).

| Criterion | Local evidence | Remote evidence |
| --- | --- | --- |
| CI runs applicable lint/types/tests/database/build | Clean offline install, lint, 3 CI tests, 9 boundary tests, 7 contract tests, 18 config tests, 2 clock/target tests, build, smoke/canaries, all workspace types and real PostgreSQL passed | [Successful Ubuntu run](https://github.com/rodrigonpaiva/rdv/actions/runs/40180923057): all gates passed, 40 tests, package and upload succeeded |
| Failed check blocks artifact promotion | Real lint regression on a temporary test branch failed `ci:quality`; old receipt/bundle removed; later gates not run; artifact absent. Tests cover every failed gate | [Controlled failed run](https://github.com/rodrigonpaiva/rdv/actions/runs/40180936823): lint failure, package/upload skipped, zero artifacts |
| Artifact and migrations match commit/lock | Full local command passed; archive's 230 payload file hashes verified independently using Python/tarfile; manifest identifies snapshot commit and lock; stale commit/lock/SQL/output/gate probes rejected | [Downloaded artifact verification](github-artifact-verification.json): all 230 payload files and 142 tracked sources match published commit; GitHub ZIP digest matches download |

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

Not executed: production/staging deployment and business/provider/AI scenarios not yet implemented. The user explicitly authorized independent review and commit/push of implementation/test branches on October 25, 2026. No merge or deployment is authorized.

## Remote execution and acceptance

- Implementation run [40180923057](https://github.com/rodrigonpaiva/rdv/actions/runs/40180923057), commit `57248ae8af969b55d45075683a671e6ddcf53077`: success on Ubuntu 24.04 with pinned Node/npm; 40 tests plus lint/types/build/smoke/canaries and real PostgreSQL. [Job/artifact metadata](github-success.json), [sanitized excerpt](github-success-excerpt.txt).
- Controlled test run [40180936823](https://github.com/rodrigonpaiva/rdv/actions/runs/40180936823), commit `9f82155636fdc09aa8d1d2d918a88a56457dd397`: expected lint failure on the isolated test branch. Packaging/upload skipped; zero artifacts. [Metadata and error excerpt](github-controlled-failure.json). The implementation branch contains no deliberate regression.
- Downloaded artifact `12593993605` using the GitHub connector and verified the ZIP digest against GitHub, tar checksum, every payload hash, every tracked source hash against `git show <commit>:<path>`, lock identity and all migration bytes. [Verification](github-artifact-verification.json). Reproduce with `python3 docs/evidence/bk-006/verify-downloaded-artifact.py <download.zip> <published-commit>` from the repository root.
- Independent reviewer separately confirmed successful quality/package/upload, exactly one successful artifact, and failed lint/skipped packaging/upload/zero failed artifacts through GitHub endpoints and logs. Root verified the downloaded archive; this does not claim independent remote archive inspection.
- Coordination accepts all three BK-006 criteria. Publication of this evidence adds documentation only; the resulting head receives its own normal workflow run. Artifact metadata always identifies the exact source commit, so evidence does not claim the documentation commit has the implementation commit's hash.

Next owner: coordinator for dependency-ready work, including BK-007. Runtime images, staging, operational deployment and branch protection remain outside this task.
