# Execution evidence — BK-001

Date: October 23, 2026. Documentation/decision task; no production resource was activated.

## Deliverables and criteria

| Criterion | Evidence |
| --- | --- |
| 1. Runtime, lockfile, architecture and compatibility | [Matrix](../../planning/bk-001-baseline.md), [ADRs 00–08](../../decisions/README.md), [npm metadata](npm-metadata.json) and engine-peer-checks.json |
| 2. Sources and precedence preserving the MVP | Matrix §1–2, PT/EN maintenance in the four sources, AGENTS.md and the previous source-inventory.json hash inventory |
| 3. External decisions and parameters by role | [Open decisions register](../../planning/open-decisions.md) with gating tasks and activation limits |

Existing identifiers, dependencies and links are checked by verify.py, without classifying unimplemented software as tested. Independent review accepted the documentation, as recorded in [review.md](review.md); the reviewer read code and results without rerunning write scripts. Official status: [coordination](../../planning/coordination.md).

## Commands actually executed and results

- pwd / rg --files --hidden: directory confirmed; initially only AGENTS.md and eight PT/EN documents in plans/.
- git rev-parse --show-toplevel: failed because Git was not initialized; this delivery had no Git commit/PR/diff. Initialization belonged to BK-002.
- node --version: v22.22.2; npm --version: 10.9.7. These differed from the target baseline 24.22.1/12.2.1.
- pnpm --version and psql --version: commands unavailable. pnpm was not selected; there was no local PostgreSQL execution evidence.
- docker --version: 29.6.2; docker compose version: v5.3.1; uname -sm: Darwin arm64.
- docker info --format '{{.ServerVersion}}': failed because the daemon socket was missing. Docker and containers were not started; client availability does not establish service availability.
- npm view next@16.4.3 version engines peerDependencies --json --cache /tmp/rdv-bk001-npm-cache --fetch-retries=0 --fetch-timeout=15000: sandbox attempt failed with ENOTFOUND. An authorized read-only public network query succeeded.
- npm view queries for the other packages: succeeded with authorized network access, without installation; preserved in npm-metadata.json. The query field retains whether discovery used latest or a major line; metadata.version contains the actual selected pin. Do not use those aliases in manifests.
- Primary web sources opened: Node, Next, Nest, Prisma v7, PostgreSQL and Redis/BullMQ, listed in matrix §6. Documentary support verification, without a provider account.
- node docs/evidence/bk-001/check-engines.cjs: semver validation using the semver module already included in local npm, without installing dependencies; selected engine/peer checks: engine-peer-checks.json. This measures declared requirements; it does not resolve all transitive dependencies or execute the stack.
- Local verification: python3 docs/evidence/bk-001/verify.py. Output persisted in verification.json; read the result from the file rather than assuming it.

## Not executed and limitations

Target runtime installation, package-lock.json generation, npm install/ci, build, application tests, migrations, exclusion/RLS SQL, combined Redis/BullMQ execution, sandbox contract tests, model calls, live Figma review and deployment: not executed. They belong to BK-002 and subsequent tasks. Compatibility here is declarative/documentary; execution still requires its own evidence.

Input hashes identify source material before corrections; they are not a backup or a replacement for Git. The then-current files were intended to be versioned during bootstrap. The evidence includes no .env, tokens, customer data or Pix instructions.
