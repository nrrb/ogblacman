# OG Blacman

Official website project for independent Chicago artist **OG Blacman**.

The site is planned as a mobile-first, statically deployable artist experience that combines music and release content with interactive features designed for memorable portrait screenshots and screen recordings. The complete product and implementation specification is in [PLAN.md](./PLAN.md).

Start with [HANDOFF.md](./HANDOFF.md) to resume implementation. The longer implementation log remains in [PROGRESS.md](./PROGRESS.md).

## Project Status

Implementation is in progress. The current build includes a responsive application shell, typed provisional content, static release routes, metadata, a functional persistent OGAmp sample playlist, the complete Tree Hugging game loop, automated tests, and a Surge preview workflow.

## Local Development

Install dependencies and start Vite:

```bash
npm install
npm run dev
```

Create and inspect the production static build with:

```bash
npm run build
npm run preview
```

## Live Preview

Publish the current static build to `https://ogblacman.surge.sh`:

```bash
npm run deploy:surge
```

The command builds with the Surge preview URL as the canonical site URL, generates the static-host support files, and deploys `dist/`. Surge authentication is required on the publishing machine.

## V1 Goals

- Present OG Blacman's identity, biography, photography, music, videos, and platform links.
- Feature the latest release and provide statically generated, deep-linkable release pages.
- Provide **OGAmp**, a persistent Winamp-inspired audio player that survives route navigation.
- Embed the touch-first **Tree Hugging** game with a branded, shareable completion state.
- Add **Black Buddha**, a scripted pixel-art assistant with contextual site interactions.
- Capture mailing-list signups through Kit.
- Provide future-ready presentation layers for Fourthwall merchandise and POSH events.
- Ship accessible, responsive, performant pages with GA4 analytics and release-specific SEO metadata.

Commerce, ticketing, user accounts, AI chat, a CMS, and persistent game or assistant state are outside the V1 scope.

## Technical Direction

- Vue 3, Vite, and TypeScript
- Vue Router for navigation and release routes
- Pinia for shared interactive state
- Custom CSS and Vue components
- Build-time prerendering for known release routes and social metadata
- Static output portable across hosting providers, with Vercel as the initial host
- Vitest for focused unit tests and Playwright for critical user flows

Content will live in centralized typed data modules rather than a CMS. Third-party services will remain behind narrow integration boundaries, and private credentials will not be exposed in the frontend bundle.

## Planned Experience

The primary route will be a single-page artist experience containing the hero, featured release, release catalog, game, biography, video, events, merchandise, mailing-list signup, and social links. Individual releases will also have canonical routes with unique titles, descriptions, artwork, Open Graph metadata, and structured data.

The interface will be designed for portrait mobile use first, with pixel-art motifs and OG Blacman branding carried through high-value interaction states. Desktop layouts will expand the composition without becoming a literal operating-system simulation.

## Delivery Outline

1. Confirm content, client assets, design references, and deployment environments.
2. Establish the Vue application, typed content architecture, routing, prerendering, design tokens, and deployment pipeline.
3. Build artist content, releases, OGAmp, the Tree Hugging game, and Black Buddha.
4. Integrate Kit, analytics, SEO, social metadata, and future commerce/event boundaries.
5. Complete accessibility, reduced-motion, performance, browser, and automated QA passes.
6. Validate production content and integrations, then launch `ogblacman.com`.

## Required Client Inputs

Implementation depends on final design references, logo and artist imagery, biography, launch releases, audio and cover art, platform and video URLs, Black Buddha artwork and dialogue direction, signup wording, privacy/contact information, and launch timing.

## Documentation

See [PLAN.md](./PLAN.md) for the full scope, product principles, architecture constraints, implementation phases, testing strategy, acceptance priorities, and definition of V1 success.
