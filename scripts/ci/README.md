# Quality CI and build bundles

Use Node 24.22.1 and npm 12.2.1. From a clean committed checkout:

```sh
npm ci
npm run ci:quality
npm run ci:artifact
```

Docker must be running. Database tests create and remove their own isolated PostgreSQL container, generating synthetic credentials; they do not use a caller-supplied database. Smoke tests use loopback only. No production credentials are needed. Prisma may download its pinned engine during its first migration run.

`ci:quality` stops at the first failed check and invalidates previous receipts/bundles while preserving `.artifacts/verification/` reports, including on checkout-validation failure. It runs `lint`, `typecheck`, `test:ci`, `check` and `test:database`. The existing `check` includes OpenAPI generation drift, boundaries, full build, contract/configuration/clock tests, real process smoke and browser secret checks. `lint` treats warnings as failures. `test:ci` covers controlled lint failures, failure sequencing, stale provenance, obsolete build outputs, and preservation of historical verification reports. Root build orchestration clears the selected workspace’s `dist` (or web `.next`) and incremental state before rebuilding; source files are preserved.

`ci:artifact` requires a successful receipt matching the current commit, lockfile, source files, toolchain and outputs. It writes `.artifacts/rdv-<commit>.tar.gz` and its SHA256 file. The archive's `manifest.json` records source and payload hashes. Packaging suppresses macOS AppleDouble metadata so archive members match the verified payload and manifest; a real archive regression covers this behavior. Migrations are copied byte-for-byte. Verify after extracting into an empty directory:

```sh
shasum -a 256 -c rdv-<commit>.tar.gz.sha256
```

The bundle contains compiled apps/packages, canonical OpenAPI, migration/schema/config and manifests/lock. It excludes cache, credentials and node_modules. It is a build handoff; runtime packaging and deployment belong to BK-090. Do not execute migrations just to inspect a bundle.

`.github/workflows/quality.yml` uses normal success conditions: a failed gate prevents packaging and upload. The upload name includes commit, run ID and attempt. Retention is 14 days. It does not deploy or change branch protection.

For an uncommitted implementation, `npm run verify:clean -- bk-006 --database` verifies a source copy excluding build outputs and local dotenv files (`.env` and `.env.*`, except regular `.env.example` templates) at every depth, and appends a uniquely named local evidence report. Included symbolic links are rejected before they are copied, even for `.env.example` or internal targets; materialize regular source files/directories first. Excluded local files are skipped without following links. Without a task argument, reports go to ignored `.artifacts/verification/`; existing reports are never overwritten. The report path is printed. This does not issue a promotion receipt or replace an actual GitHub execution. A controlled failure must be published only to an authorized test branch; record the run URL/conclusion and absence of artifacts before deleting that branch with authorization.
