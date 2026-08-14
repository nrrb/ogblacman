# OG Blacman Implementation Handoff

Last updated: August 13, 2026

## Current State

Work is paused after completing three interactive phases:

- functional OGAmp sample-audio player
- functional Tree Hugging game
- functional scripted Black Buddha assistant

Live static preview (through Interactive Checkpoint 2): `https://ogblacman.surge.sh`

The live preview was deployed successfully from the prior production build. The new Black Buddha checkpoint is verified locally but has not been published.

## Completed

### Foundation

- Vue 3, Vite, TypeScript, Vue Router, Pinia, Vite SSG, Vitest, and Playwright setup
- mobile-first responsive shell, navigation, footer, and fixed player accommodation
- typed artist, release, and track data boundaries
- statically generated `/`, `/privacy`, and `/music/next-transmission` pages
- route-specific canonical, description, Open Graph, Twitter, and structured metadata
- generated sitemap and static-host fallback files
- local `npm run dev` workflow and Surge deployment workflow

### OGAmp

- five provisional MP3 sample tracks from `public/music/`
- play/pause, previous, next, seek, and queue selection
- compact responsive playlist drawer
- loading and playback error states
- playback continuity across Vue Router navigation
- slug-based selected-track and position restoration after refresh
- browser autoplay restrictions respected: state restores without forced playback
- provisional release CTA connected to a deterministic sample preview track

The sample chiptunes are not presented as OG Blacman releases. They remain isolated in `src/content/tracks.ts` and are marked as provisional sample audio.

### Tree Hugging

- pointer and keyboard press-and-hold interaction
- explicit pointer capture so the fixed player cannot interrupt a hold
- five tree growth stages with increasing trunk, foliage, fruit, and expression changes
- temporary CSS pixel OG avatar
- randomized per-run target score from `$1,000` to `$5,000`
- monotonic, progress-correlated score that lands exactly on the target
- portrait-oriented branded Chicago completion composition
- reset/replay with a new per-run target
- accessible progress/status semantics and reduced-motion compatibility
- no persistence across refresh, as required by PLAN.md

### Black Buddha

- typed provisional dialogue isolated in `src/content/blackBuddha.ts`
- deterministic triggers for arrival, first playback, game start/completion, release routes, story visibility, and inactivity
- priority-aware ambient/interaction prompts with per-session trigger history
- 18-second ambient prompt cooldown and 30-second post-dismissal cooldown
- close/dismiss and always-available manual reopen behavior
- provisional CSS pixel-art character pending client source art
- internal navigation actions that preserve the Vue shell and OGAmp
- responsive placement that observes marked critical-control groups and moves to the opposite viewport edge
- no persistence across refresh, as required by PLAN.md

## Verification

All checks passed immediately before this handoff:

```text
npm run typecheck  -> passed
npm test           -> 5 files, 20 tests passed
npm run build      -> passed; 3 routes statically generated
npm run test:e2e   -> 14 tests passed across Pixel 7 and desktop Chrome
npm audit          -> 0 vulnerabilities
```

The browser suite covers:

- responsive home layout and horizontal overflow
- direct release deep links and canonical metadata
- real MP3 response/loading
- playback across route navigation
- queue selection, seeking, and refresh restoration
- no forced autoplay after refresh
- Tree Hugging completion, final score bounds, and reset
- Black Buddha arrival, dismissal, reopening, game reaction, and non-blocking placement

## Surge Preview Notes

Deployment command:

```bash
npm run deploy:surge
```

This builds with `VITE_SITE_URL=https://ogblacman.surge.sh`, then publishes `dist/`.

Verified live responses:

- `/` -> `200 text/html`
- `/music/next-transmission` -> `200 text/html`
- `/music/01-dungeon-crawl.mp3` -> `206 Partial Content`, `audio/mpeg`, byte ranges accepted
- release canonical -> `https://ogblacman.surge.sh/music/next-transmission`

Surge forcibly serves `User-agent: * / Disallow: /` for `*.surge.sh` subdomains even though the generated local `robots.txt` allows crawling. This is acceptable for a client preview and prevents accidental indexing. The production custom domain/static host must serve the generated allow/sitemap rules instead.

## Resume Steps

1. Pull `main` and run `npm install`.
2. Run `npm run dev`; use the URL Vite prints because port `5173` may already be occupied.
3. Run `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e` before extending shared behavior.
4. Collect/replace pending client content: real artist photos, logo, approved bio, releases, real music, artwork, platform links, Black Buddha source art/dialogue, Kit endpoint/copy, privacy/contact details, and GA4 ID.
5. Implement the typed events/merch empty states and provider-neutral external-link boundaries.
6. Implement Kit only after its public form action/identifier and approved consent wording are available.
7. Continue with the analytics abstraction/instrumentation, final SEO content, accessibility/performance review, and production launch work.

## Intentional Gaps

- Placecats is used only for the artist-photo placeholder.
- The release entry and release content are provisional and remain `noindex`.
- OGAmp audio is provisional generated sample music, not OG Blacman music.
- The CSS pixel OG avatar is temporary pending approved source art.
- Black Buddha's CSS art and dialogue are provisional pending approved client source material and voice direction.
- Kit, GA4, live social/platform links, live events, and live merchandise are not implemented.
- Final design references and client assets are still pending.

See [PLAN.md](./PLAN.md) for the complete product specification and [PROGRESS.md](./PROGRESS.md) for the longer implementation log.
