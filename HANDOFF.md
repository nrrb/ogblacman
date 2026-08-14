# OG Blacman — Claude Code + Claude Design Handoff

Last updated: August 14, 2026 (revised after the copy, analytics, and Kit phase)

## Start Here

This repository contains the current implementation of the OG Blacman artist site. The working application is a mobile-first Vue static site with a persistent custom music player, an interactive Tree Hugging game, and the scripted Black Buddha assistant.

At the start of this handoff:

- branch: `feat/og-voice-copy`, branched from `main` at `a63996e` and not yet merged or pushed
- current implementation commit: `19a6c58` (`feat: add Kit mailing-list signup with inline validation and states`)
- `origin/main` still points to `a63996e`; the copy, analytics, and Kit work exists only locally
- `instagram/` is an untracked caption export used to derive site copy
- repository: `git@github.com:nrrb/ogblacman.git`

### Required environment variables

Both features are built and inert until these are configured for the deploy environment:

| Variable | Effect when unset | Effect when set |
| --- | --- | --- |
| `VITE_GA_MEASUREMENT_ID` | No GA script loads; all tracking calls no-op | GA4 loads and receives the tracked event set |
| `VITE_KIT_FORM_ACTION` | Signup form renders disabled | Signup form submits to Kit |

The recorded Surge preview is `https://ogblacman.surge.sh`, but do not assume it matches the current repository. The last documented manual deployment predates the latest custom OGAmp and canvas-spectrum work.

Read [PLAN.md](./PLAN.md) for the full product specification. [PROGRESS.md](./PROGRESS.md) is the longer implementation history, but this file is the current operational source for resuming work.

## Current Product State

The application currently includes:

- responsive hero, music, game, story, shows, merchandise, signup, and footer sections
- prerendered `/`, `/privacy`, and `/music/next-transmission` routes
- route-specific canonical, Open Graph, Twitter, and structured metadata
- persistent custom OGAmp playback across Vue Router navigation
- five provisional one-minute DnB files under `public/music/`
- a collapsible OGAmp playlist sourced from one editable JSON manifest
- a performant audio-reactive canvas spectrum
- the complete press-and-hold Tree Hugging game loop
- the supplied Black Buddha pixel-art figure and deterministic assistant behavior
- future-ready event and merchandise presentation boundaries
- Vitest and Playwright coverage for the critical flows
- static-host output and a manual Surge deployment command

There is no Webamp dependency or runtime code in the current application. Webamp appeared temporarily in commit history and was deliberately removed. Keep OGAmp custom unless the product direction explicitly changes again.

## Latest OGAmp Architecture

The current player is split intentionally:

- `src/stores/player.ts` owns the `HTMLAudioElement`, Web Audio graph, track state, persistence, seeking, and frequency-data access.
- `src/components/OGAmp.vue` owns the visible transport and collapsible playlist.
- `src/components/OGSpectrum.vue` owns canvas rendering and all per-frame visualization data.

Important performance decision: spectrum frames must not be stored in Pinia or Vue reactive state. `OGSpectrum.vue` uses reusable typed arrays, precomputed frequency-band ranges, one 280×94 canvas, and direct `requestAnimationFrame` drawing. This avoids virtual-DOM updates and per-bar style recalculation.

The current analyzer:

- draws 14 chunky cyan, magenta, and acid-green bands
- uses a 256-point Web Audio FFT
- updates at display refresh rate, approximately 50–60 distinct frames per second in Chromium testing
- stops rendering when the document is hidden
- becomes static when `prefers-reduced-motion: reduce` is active
- measured about 80 ms of main-thread task time over five seconds in local headless Chromium, approximately 1.6% of one CPU core, with zero style recalculation during the measurement

That benchmark is a regression indicator, not a guarantee for every browser or machine. If the spectrum is changed, profile actual playback and preserve the direct-canvas boundary.

## Music Source of Truth

`src/content/playlist.json` is the only human-editable source of truth for:

- track order
- display title
- artist attribution
- public audio URL
- measured duration
- provisional status

`src/content/tracks.ts` consumes that manifest; do not duplicate track metadata elsewhere.

To replace the playlist from the files currently in `public/music/`:

1. Install FFmpeg so `ffprobe` is available.
2. Replace the files in `public/music/`.
3. Run `npm run playlist:sync`.
4. Review `src/content/playlist.json` and manually correct display metadata if needed.

The sync script reads embedded title/artist metadata and duration, derives URL-safe slugs, and falls back to filename-derived titles plus `OG Blacman`. The current files are provisional and retain the embedded artist value `Procedural DnB Generator`.

## Architecture and Editing Map

| Area | Primary files | Notes |
| --- | --- | --- |
| App shell | `src/App.vue`, `src/components/SiteHeader.vue`, `src/components/SiteFooter.vue` | OGAmp and Black Buddha live outside route views so they survive navigation. |
| Homepage composition | `src/views/HomeView.vue` | Main section ordering and homepage metadata. |
| Global design | `src/styles/main.css` | Single large stylesheet; mobile-first with the main desktop breakpoint at 720px. |
| Artist/site content | `src/content/site.ts` | Biography, location, navigation, social links, and current Placecats hero placeholder. |
| Releases | `src/content/releases.ts`, `src/views/ReleaseView.vue`, `src/components/ReleaseCard.vue` | Current release is provisional and therefore `noindex`. |
| Music metadata | `src/content/playlist.json`, `src/content/tracks.ts` | JSON manifest is authoritative. |
| Music metadata tool | `scripts/sync-playlist.mjs` | Requires `ffprobe`. |
| OGAmp | `src/components/OGAmp.vue`, `src/components/OGSpectrum.vue`, `src/stores/player.ts` | Custom player; preserve canvas spectrum performance. |
| Tree Hugging | `src/components/TreeHuggingGame.vue`, `src/features/tree-game/gameLogic.ts` | Session-only state; no refresh persistence by design. |
| Black Buddha | `src/components/BlackBuddha.vue`, `src/stores/blackBuddha.ts`, `src/content/blackBuddha.ts` | Dialogue is provisional and deterministic; no AI/backend. |
| Events and merch | `src/content/marketplace.ts`, `src/components/EventsSection.vue`, `src/components/MerchSection.vue` | Collections are intentionally empty; provider URLs remain content data. |
| Analytics | `src/analytics/events.ts`, `src/analytics/index.ts` | Typed event contract plus the GA4 boundary. Never call gtag from components. |
| Mailing list | `src/features/mailing-list/kitLogic.ts`, `src/components/SignupForm.vue` | Kit endpoint comes from `VITE_KIT_FORM_ACTION`; inert without it. |
| Types | `src/types/content.ts` | Extend these boundaries before adding ad hoc component data. |
| Routing | `src/router/index.ts` | Release routes are generated from release content. |
| Metadata | `src/composables/usePageMeta.ts`, release/home views | `VITE_SITE_URL` controls canonical origin. |
| Static build | `vite.config.ts`, `scripts/finalize-build.mjs` | Generates prerendered routes plus static-host support files. |
| Browser tests | `tests/e2e/home.spec.ts`, `playwright.config.ts` | Pixel 7 and desktop Chrome projects. |

## Development and Verification

Install and run locally:

```bash
npm install
npm run dev
```

Use this verification order, sequentially:

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Do not run `npm run build` and `npm run test:e2e` concurrently. Playwright previews `dist/` at port 4173, so replacing the production build while the browser suite is running can make early workers load stale output. Also note that `reuseExistingServer` is enabled outside CI; stop any stale process on port 4173 if browser results contradict the source.

Most recent verified result:

```text
npm run typecheck  -> passed
npm test           -> 10 files, 49 tests passed
npm run build      -> passed; 3 routes prerendered
npm run test:e2e   -> 20 tests passed across Pixel 7 and desktop Chrome
```

The spectrum browser test verifies that the renderer is a canvas, that idle and successive playback frames differ, and that switching to reduced-motion freezes the visualization. Manual automation also verified that hiding the document stops canvas changes and returning to it resumes animation.

## Design Guardrails for Claude Design

The current look is intentionally bold, editorial, and screenshot-friendly rather than a literal desktop/Winamp simulation. Preserve these established traits while refining the next phase:

- black, off-white, bright blue, red, acid green, cyan, and magenta palette
- heavy condensed typography and small monospace/technical labels
- hard borders, offset shadows, strong color blocking, and restrained pixel-art motifs
- portrait-first layouts with recognizable branding in cropped screenshots and screen recordings
- OGAmp as a fixed floating object with a strong page shadow
- Black Buddha placed away from controls marked with `data-buddha-avoid`
- visible keyboard focus, meaningful labels, and touch-friendly controls
- no horizontal overflow at mobile widths
- reduced-motion behavior as a first-class design state
- fixed-player safe-area and bottom-spacing accommodation

The current design was influenced by the client-provided Claude artifact:

`https://claude.ai/code/artifact/628261ff-17c7-440b-a46e-d2ace26b9e61`

The OGAmp spectrum was also shaped by a supplied screenshot showing a black player, chunky multicolor bands, bold current-track typography, oversized controls, and a collapsible queue.

When changing OGAmp layout, retain the native canvas dimensions or re-profile it after changing resolution. Do not reintroduce one reactive DOM element per spectrum band.

## Known Intentional Gaps

- All site copy is derived from the artist's Instagram captions and is written in first person, so it needs his approval before launch.
- The hero still uses a Placecats image and placeholder alt text.
- Final logo files, artist photography, biography, and approved brand copy are missing.
- The only release entry is provisional, points to placeholder artwork, and is marked `noindex`.
- Current music and its release mapping are provisional.
- Spotify, Apple Music, YouTube, social, and video URLs are not populated.
- Black Buddha uses the supplied figure, but its lore and dialogue remain provisional.
- The Tree Hugging game's CSS pixel OG avatar is temporary.
- Events and merchandise collections are empty until real listings exist.
- Kit signup is built but inert until `VITE_KIT_FORM_ACTION` is set; consent wording is unapproved.
- GA4 is built but sends nothing until `VITE_GA_MEASUREMENT_ID` is set.
- `social_click` and `signup_success` exist in the analytics contract, but no social links are populated yet.
- Contact wording and final production metadata are incomplete.
- Production hosting, domain/DNS validation, and final launch QA remain outstanding.

## Recommended Next Phase

The next phase should focus on replacing provisional presentation and completing launch integrations rather than expanding the application architecture.

1. Use Claude Design to establish the final art direction for hero, artist story, release system, and section transitions using approved assets.
2. Replace the Placecats hero, temporary avatar, provisional release art, biography, and placeholder copy.
3. Populate final releases and platform/video links through the typed content files.
4. Review and approve Black Buddha voice/lore, then replace only `src/content/blackBuddha.ts` dialogue unless behavior also needs revision.
5. ~~Add a small analytics abstraction and instrument key interactions.~~ Done; set `VITE_GA_MEASUREMENT_ID` to activate.
6. ~~Integrate Kit.~~ Done; set `VITE_KIT_FORM_ACTION` to activate, and approve the consent/success/error wording.
7. Populate events and merchandise when client-approved listings and provider URLs exist.
8. Perform the final WCAG, mobile Safari/Chrome, performance, metadata, and social-preview pass.
9. Deploy to UAT, obtain content/design approval, then complete production domain and analytics validation.

Keep the application static-first. Do not add a CMS, backend, user accounts, persistent game state, or AI chat for V1.

## Deployment

Manual Surge preview deployment:

```bash
npm run deploy:surge
```

This builds with `VITE_SITE_URL=https://ogblacman.surge.sh` and publishes `dist/`. Surge authentication is required.

Surge overrides `robots.txt` for `*.surge.sh` subdomains with `Disallow: /`; that is acceptable for preview. Production hosting must serve the generated crawl and sitemap files from `scripts/finalize-build.mjs`.

The planned production architecture remains portable static hosting. Environment variables must contain public environment configuration only; no private secrets can be protected in the frontend bundle.

## Definition of a Safe Continuation

Before handing a future phase back:

- preserve typed, centralized content boundaries
- keep OGAmp and Black Buddha outside route views
- keep OGAmp spectrum data outside Vue reactivity
- keep game and assistant state session-only
- keep direct release routes prerenderable
- run the full verification sequence in order
- visually inspect mobile and desktop output
- record deployment status separately from repository status
- use atomic commits and clearly identify anything not pushed or deployed
