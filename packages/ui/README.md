# DS 2.0 foundation

BK-008 implements reusable visual primitives from the English DS **2.0 content**, sections 2–8 and 10–13, and ET section 16. It does not implement booking, finance, identity, role-based navigation or the complete component catalog.

## Import and build

Import styles once from the app root and use public exports:

```tsx
import '@agenda/ui/styles.css';
import { Button, PageContent, Panel, PublicHeader, SkipLink, TextField } from '@agenda/ui';
```

`npm run build:packages` builds TypeScript and copies CSS, font and license into `packages/ui/dist`. `npm run build` also runs this step before web. The stylesheet export resolves to built assets; build shared packages before starting web in a fresh checkout. The font is Inter variable normal Latin, pinned to @fontsource-variable/inter 5.3.0 under OFL-1.1. Its WOFF2 and license are copied locally; no font CDN or network font download is required during build/page use after installation. Consumers should supply additional font subsets before extending beyond the supported Latin glyphs.

`tokens.css` is the single color/geometry/spacing source: neutral primitives map to the DS's `--color-*` semantic names. Existing study `--ag-*`/Figma short names map to the same roles: bg→surface-base, text→content-primary, muted→content-secondary, line→border-subtle, canvas→surface-canvas and black→action-primary. State color pairs use success/warning/error/info. Do not create a second hex palette in consuming components. CSS and font/license are included in the existing build bundle through the UI dist tree.

## Components and ownership

| Export | Behavior / caller responsibility |
| --- | --- |
| `PublicHeader`, `PageContent`, `SkipLink` | Header #202020/white content, centered 1120 px page; default main target `main-content` is programmatically focusable. Supply localized skip text. Header slots do not grant navigation permissions. |
| `Panel` | Base white or supporting #F7F8F9 with 1 px Dividers #D9DDE1, 12 px radius. Own heading/semantic context belongs to the consumer. |
| `Button` | Primary/secondary/outline/ghost/destructive, default type=button, 44 px minimum, visible keyboard focus and pressed/hover/disabled states. Loading keeps focus, exposes busy/disabled semantics and blocks click intent. Supply a localized loadingLabel for clear text; both label sizes reserve stable width. Native disabled is separate and needs nearby reason text. |
| `TextField`, `SelectField`, `CheckboxField` | Persistent labels, unique IDs and associated help/errors. Text/select controls use 16 px fonts and 44 px minimum height; checkbox label gives a 44 px target. Loading text is read-only; loading select is disabled, preserving its supplied selection. Pass values/handlers to preserve state; validation remains the caller/server's responsibility. Required fields use native required semantics, not only the visual marker. |
| `StatusBadge`, `Banner` | Labeled semantic tones. Banner has no implicit live role; add status/alert for newly changing feedback only. State names do not imply validated booking/payment/refund transitions. |
| `EmptyState`, `Skeleton` | Explain an empty result or loading context without inventing financial information. Skeleton is static and has an accessible loading name. |
| `Dialog` | Controlled open/onClose, native showModal for background inertness, title association, title-first focus, explicit Tab/Shift+Tab wrap and trigger return. Close label is caller-supplied/localized; Escape and close are blocked while busy, so provide a nearby wait/recovery explanation. No backdrop click dismissal by default. |

Components own presentation and intent only. A loading click guard is not server idempotency or authorization. Do not optimistically display confirmed bookings, received payments or completed refunds; use validated backend outcomes. Closing a dialog does not undo a committed operation. Caller state/operation references remain authoritative; recovery must query actual state.

## Internal demonstration

After building packages, run `npm run dev:web` and open `/internal/design-system`. The Next development phase enables the explicit `page.demo.tsx` extension. Production keeps only ordinary page extensions, so this route is absent (404), and the demo's local simulation controls are not a product journey. No environment secret lookup is added to browser code, and no Figma file is modified.

The developer-only page uses English explanatory content, with the approved Brazilian Portuguese visual sample retained and language-marked. It shows the specified light panels and contextual secondary “Seu próximo cuidado.” / “R$ 20,00”; this does not style every financial amount as secondary. All demonstration data/actions are fictional, local and unrelated to booking/payment services. The public foundation home has only the existing product copy and header; no demo link or financial example is added there.

## Verification

[Executed BK-008 evidence](../../docs/evidence/bk-008/README.md) records screenshots and browser keyboard/semantics checks at 320, 375, 768, 1024 and 1440, light theme under a dark host, local font requests, reduced motion and text resizing. It also records the production route check and build/contract/secret-boundary checks. Browser assertions/screenshots are acceptance evidence, not CSS-mirroring unit tests or a claim of full WCAG 2.2 AA certification. Real screen-reader, mobile virtual keyboard and broader browser/assistive-technology coverage remain product verification work.

Technical references: [native dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), [React input behavior](https://react.dev/reference/react-dom/components/input), [Next page extensions](https://nextjs.org/docs/app/api-reference/config/next-config-js/pageExtensions), [Fontsource Inter](https://fontsource.org/fonts/inter/use).
