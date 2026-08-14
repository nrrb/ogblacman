# OG Blacman Implementation Handoff

Last updated: August 13, 2026

## Current State

Work is paused after completing six implementation milestones:

- functional OGAmp player with the current five-track DnB set
- functional Tree Hugging game
- functional scripted Black Buddha assistant using the supplied source figure
- typed events/merchandise presentation and provider boundaries
- client asset refresh for Black Buddha and OGAmp
- official Webamp integration, branded and constrained as OGAmp

Live static preview (through Interactive Checkpoint 2): `https://ogblacman.surge.sh`

The live preview was deployed successfully from the prior production build. The Black Buddha and marketplace checkpoints are verified locally but have not been published.

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

- official Webamp 2.3.1 main and playlist windows, dynamically loaded and branded as OGAmp
- five current one-minute DnB tracks from `public/music/`
- single human-editable playlist manifest at `src/content/playlist.json`
- `npm run playlist:sync` metadata workflow for replacing the files without editing application code
- native play/pause, previous, next, seek, shuffle, repeat, and queue selection controls
- fixed, expanded playlist with all current tracks visible
- close, minimize/windowshade, playlist-toggle, and external Webamp navigation controls locked so both windows remain present
- title-bar double-click and context-menu escape paths blocked while window dragging remains available
- loading and playback error states
- playback continuity across Vue Router navigation
- slug-based selected-track and position restoration after refresh
- browser autoplay restrictions respected: state restores without forced playback
- provisional release CTA connected to the deterministic first playlist track

The current MP3s retain their embedded `Procedural DnB Generator` attribution. They remain isolated in `src/content/tracks.ts` and marked provisional until final release mapping and approval are supplied.

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
- supplied `BLACKBUDDHA-LOVE.PNG` pixel-art figure installed as a local site asset
- internal navigation actions that preserve the Vue shell and OGAmp
- responsive placement that observes marked critical-control groups and moves to the opposite viewport edge
- no persistence across refresh, as required by PLAN.md

### Events and merchandise

- typed event, merchandise, content-image, status, and provider-link models
- centralized empty launch collections in `src/content/marketplace.ts`
- populated Upcoming Shows cards with venue-local time formatting, artwork fallback, location, status, and external ticket actions
- populated Merch cards with product imagery fallback, display price, status, and external checkout actions
- branded, accessible empty states that point visitors toward the future mailing-list form
- provider-neutral outbound links carrying stable provider IDs and future analytics event names
- POSH, Fourthwall, venue, promoter, and alternate-provider URLs can be added through content without component changes
- responsive section layouts and six-item primary navigation verified from mobile through desktop

## Verification

All checks passed immediately before this handoff:

```text
npm run typecheck  -> passed
npm test           -> 7 files, 28 tests passed
npm run build      -> passed; 3 routes statically generated
npm run test:e2e   -> 18 tests passed across Pixel 7 and desktop Chrome
npm audit          -> 0 vulnerabilities
```

The browser suite covers:

- responsive home layout and horizontal overflow
- direct release deep links and canonical metadata
- real MP3 response/loading
- playback across route navigation
- queue selection and refresh restoration
- no forced autoplay after refresh
- locked OGAmp main/playlist close, minimize, toggle, and external-navigation paths
- Tree Hugging completion, final score bounds, and reset
- Black Buddha arrival, dismissal, reopening, game reaction, and non-blocking placement
- event/merch empty states, anchor navigation, and responsive page overflow

## Surge Preview Notes

Deployment command:

```bash
npm run deploy:surge
```

This builds with `VITE_SITE_URL=https://ogblacman.surge.sh`, then publishes `dist/`.

Verified live responses from the deployed Checkpoint 2 build:

- `/` -> `200 text/html`
- `/music/next-transmission` -> `200 text/html`
- `/music/01-dungeon-crawl.mp3` -> `206 Partial Content`, `audio/mpeg`, byte ranges accepted
- release canonical -> `https://ogblacman.surge.sh/music/next-transmission`

Surge forcibly serves `User-agent: * / Disallow: /` for `*.surge.sh` subdomains even though the generated local `robots.txt` allows crawling. This is acceptable for a client preview and prevents accidental indexing. The production custom domain/static host must serve the generated allow/sitemap rules instead.

## Resume Steps

1. Pull `main` and run `npm install`.
2. Run `npm run dev`; use the URL Vite prints because port `5173` may already be occupied.
3. Run `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e` before extending shared behavior.
4. Collect/replace pending client content: real artist photos, logo, approved bio, releases, final music/release mapping, cover art, platform links, Black Buddha dialogue, Kit endpoint/copy, privacy/contact details, and GA4 ID.
5. Implement the analytics abstraction and instrument the required V1 interactions; enable GA4 delivery when its measurement ID arrives.
6. Implement Kit only after its public form action/identifier and approved consent wording are available.
7. Continue with final SEO content, accessibility/performance review, and production launch work.

## Intentional Gaps

- Placecats is used only for the artist-photo placeholder.
- The release entry and release content are provisional and remain `noindex`.
- OGAmp uses official Webamp with the current generated DnB set and remains provisional pending final release mapping and approval.
- The CSS pixel OG avatar is temporary pending approved source art.
- Black Buddha's supplied source art is installed; dialogue remains provisional pending approved lore and voice direction.
- Event and merchandise collections are intentionally empty until client listings exist; their presentation and provider boundaries are implemented.
- Kit, GA4 delivery, and live social/platform links are not implemented.
- Final design references and client assets are still pending.

See [PLAN.md](./PLAN.md) for the complete product specification and [PROGRESS.md](./PROGRESS.md) for the longer implementation log.
