# BK-008 — Design system 2.0 foundation

Date: October 25, 2026. Status: implemented and author-verified; independent review pending. Branch/base: `feat/bk-008-design-system` / `c0b8380`. No commit, push, merge, deployment or Figma publication performed.

## Scope and criteria

Sources: English backlog BK-008 (accepted dependency BK-002); DS 2.0 sections 2–8, 10–13 and inventory scope; ET sections 16/20/23; AGENTS. This cross-cutting visual foundation has no dedicated business view or RF/CA acceptance claim. The wider DS component catalog and all business flows remain future slices.

| Criterion | Implementation | Executed evidence |
| --- | --- | --- |
| Dark header, light surfaces, 1 px Dividers | Canonical CSS primitives/semantic tokens; PublicHeader, PageContent, Panel and shared styles | Visual comparison plus real-browser measurements at 320/375/768/1024/1440: header #202020, page white, supporting panels #F7F8F9 and sample white, 1 px #D9DDE1 borders; no horizontal page overflow |
| Contextual secondary sample title/price | Approved “Seu próximo cuidado.” and “R$ 20,00” use #4E5860 in the internal sample; no global price metadata rule | Screenshot comparison and measured computed colors at all five widths. White area remains behind panels; sample data is explicitly illustrative |
| Basic components support focus/error/loading and 16 px fields | Button variants, labeled text/select/checkbox, badges/banners/empty/loading feedback and controlled dialog; native semantics plus explicit focus wrap | Real keyboard tests: skip link, loading width/guard, associated validation error with preserved input, select/checkbox, modal title focus, 16 Tab/Shift+Tab steps, Escape/trigger return, busy dismissal guard and retained note after error. Visible text/select fields measure 16 px and at least 44 px high; main buttons meet 44 px targets |

[Component API and ownership](../../../packages/ui/README.md). The stylesheet/normal variable Inter font and OFL license are built into UI dist, with a public styles export. New dependency: @fontsource-variable/inter **5.3.0**, OFL-1.1, exact development pin. No existing locked package version changed. No backend, public business API, database/schema, authorization, provider or financial behavior was added.

## Browser and visual evidence

The available Playwright connector expected a Chrome application that is absent on this host. Verification instead used an isolated Playwright **1.57.0** client under `/tmp`, with the already-installed Chromium headless shell. This is tooling-only and is not a project dependency. No actual integration accounts or customer data were used.

- [Browser checks and viewport metrics](review.json): five viewport widths, local Inter face loaded, no page errors, local GET requests only, keyboard/form/dialog interactions, dark host retaining the light theme, reduced-motion preference and 200% text-size reflow at 320 px.
- Visual captures: [320](demo-320.png), [375](demo-375.png), [768](demo-768.png), [1024](demo-1024.png), [1440](demo-1440.png). Desktop/full mobile composition and the modal were visually inspected against DS 2.0. Screenshots include framework development indicators where present; these are not product components.
- [Dialog error/focus at 320](dialog-error-320.png) and [text resizing at 320](text-resize-320.png).
- [Production proof](production.json): internal demo route returns **404** and is absent from the production route manifest; public root returns 200 in pt-BR; skip link focuses main; font/CSS/license appear in the build inventory; measured text/state pairs meet 4.5:1 and control-border/focus pairs meet 3:1 in the tested colors.
- [Production home](production-home-375.png) contains only the existing foundation copy/header; no internal demo link or simulation controls are published.

The internal page uses `page.demo.tsx`, enabled only in the Next development phase. It is deliberately excluded by production page extensions. Its explanatory copy is English, with the approved sample marked pt-BR; the public product root retains pt-BR. Development samples simulate local visual states only, not bookings, settlement or provider status. Browser loading/error examples perform no business requests.

## Build and code checks

`npm run lint` and all-workspace `npm run typecheck` passed during implementation. After fixes, `npm run verify:clean -- bk-008` passed in an artifact-free source copy: offline locked installation, lint, 9 CI tests, OpenAPI/drift, 10 boundary tests, full production build, 7 contract tests, 18 config tests, 3 clock/CLI tests, API/worker/web smoke, client secret canaries and all-workspace types. **47 existing tests**, plus non-test gates; lock unchanged during reproduction.

The uniquely named `clean-verification-*.json` report in this directory records exact commands/results and the temporary source-copy path. The production probe used that successful clean build rather than the development output. `git diff --check` and scoped file review passed; source-generated Next type references were restored through production build, not manually patched.

## Findings addressed

The first development route import used a Node-style `.js` suffix that the web bundler did not resolve to the source TSX file. It now uses the web's Bundler-resolution import and returns 200.

Chromium's native dialog traversal allowed a focus escape during the keyboard probe. An explicit Tab/Shift+Tab wrap now supplements native modal inertness, including a no-tabbable-controls fallback. All final containment, dismissal and focus-return checks passed.

At 320 px with text doubled, the metrics grid's intrinsic minimum sizes could extend outside its panel. Explicit minmax(0,1fr) tracks and text wrapping fix that without shrinking text or clipping content. Final reflow passed.

A Next-generated `apps/web/AGENTS.md` appeared during development. Its relevant version-matched docs were consulted, then only that task-generated file was removed after stopping dev; existing root instructions were preserved and no tool-generated policy was added to the delivery.

## Reproduce and limitations

Build shared packages, start web dev on an isolated loopback port, and open `/internal/design-system`. [Browser review script](browser-review.mjs) and [production review script](production-review.mjs) record the executed checks; they use the documented machine-specific `/tmp` Playwright client/cache and evidence/report paths. Install the same temporary client and adapt those paths/port for another machine. Do not import these evidence utilities into the product or infer a new CI browser gate.

Not executed: real VoiceOver/NVDA or mobile virtual-keyboard sessions, broader browser/assistive-technology matrix, external provider/domain/financial acceptance, a fresh PostgreSQL rerun (no database changes), exact committed-snapshot artifact publication, remote CI, independent review or deployment. Browser accessibility semantics, focus, contrast and reflow are useful evidence, not full WCAG 2.2 AA certification. Font/state/geometry checks are acceptance observations rather than CSS-mirroring unit tests.

Next owner: independent reviewer/coordinator for acceptance and subsequent dependency-ready tasks. Only actually authorized backend/domain outcomes may be presented as financial or booking success when these components are consumed later.

## Subsequent publication review — 2026-10-27

The user subsequently authorized review and conditional commit/push. [Author review and task supplement](pre-publication-review.md) record the reproduced initially-open Strict Mode modal issue, its correction and post-fix browser verification. [Post-fix metrics](review-after-fix.json) passed the complete existing interaction probe. Historical reports/screenshots above are preserved; a new unique clean-verification report records the corrected source. Independent approval and remote CI remain unclaimed.
