# Portfolio cleanup

The prior README was the Vite template. The replacement documents the actual application, existing screenshots, offline setup and integration boundaries.

## Removed artifacts

- `m*.patch`: historical patch exports, absent from application/config references; original changes remain in Git history.
- `api/create-checkout.ts.save`: unused handler backup; deployed source is `api/create-checkout.ts`.
- `tsc`, `vite-react-ts@0.0.0`: empty accidental root files, not scripts.
- `public/vite.svg`, `src/assets/react.svg`: unused template assets; no source/HTML reference found.
- `.vite-source-tags.js`: editor element-picker instrumentation referenced only from Vite config. Its optional import is removed too.
- Account-wide metadata files: replaced by reviewed maintenance files prepared alongside the `ayanirfan099` profile README.

History and source/config references were checked before removal. All existing screenshots remain.

## Baseline checks

Before cleanup, `npm ci --no-audit --no-fund` and `npm run build` passed; build emitted a large-chunk warning. `npm run lint` failed with 42 errors, primarily existing dynamic handler `any` types and React effect/immutability rules. This change does not disable the rules or silently claim they pass. See the PR for post-change exact results.

## Remaining security work

Client availability cannot prevent simultaneous writes. Checkout accepts client-supplied amounts and redirects. The email handler verifies a Supabase user, not a separate administrator role. Voice authorization is optional when `VAPI_TOOL_SECRET` is empty. Resolve these independently before real deployment. No external service or live configuration is changed here.
