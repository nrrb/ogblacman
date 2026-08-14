# OG Blacman Website Implementation Plan

## 1. Purpose

Build `ogblacman.com` as the official, mobile-first web home for independent Chicago artist **OG Blacman**.

The site should combine conventional artist-site needs with memorable interactive elements that make the experience visually distinctive enough to invite screenshots and portrait screen recordings for social sharing.

The initial release should promote OG Blacman, feature current music and video, capture mailing-list signups, and establish reusable presentation components for future merchandise and ticketed events. Commerce and ticketing infrastructure are planned as Phase 2 integrations.

This document defines product scope, architectural direction, data boundaries, quality expectations, and implementation phases. It intentionally avoids prescribing detailed component/file structure so Codex can propose implementation details within these constraints.

---

## 2. Product Principles

1. **Mobile first.** Design for portrait phone use first, then adapt intentionally to larger screens.
2. **Distinctive and shareable.** Important states should remain recognizable as OG Blacman content when screenshotted or screen-recorded without the browser URL visible.
3. **Static first.** Prefer build-time data and browser-side interaction. Avoid backend infrastructure unless a future feature truly requires it.
4. **Artist-owned experience.** `ogblacman.com` is the branded destination. External platforms handle specialized transactional services such as merch fulfillment and ticketing.
5. **Fast path to launch.** Keep V1 focused on artist content, music, the Tree Hugging game, Black Buddha, mailing-list capture, analytics, SEO, and responsive polish.
6. **Easy developer maintenance.** Content should be centralized in typed local data/config files and editable without a CMS.
7. **Portable hosting.** The production build must remain deployable to ordinary static hosting. Vercel is the initial host but the application should not depend on Vercel-specific runtime features.
8. **Progressive enhancement.** Interactive features should enrich the site without making basic artist information, music links, or signup inaccessible when animations or advanced effects are unavailable.

---

## 3. Reference Site

Client reference: `https://rainechristian.com/`

Use the reference primarily for **content-model inspiration**, including:

- release-focused artist homepage
- individual music/release pages
- merchandise presentation
- show/event presentation
- mailing-list signup
- social and music-platform links

Do not copy its visual design. OG Blacman's site should have a more custom interactive identity.

---

## 4. Launch Scope

### Included in V1

- responsive mobile-first single-page artist site
- deep-linkable individual song/release routes
- featured latest release
- 3-5 song/release entries
- custom persistent Winamp-inspired player, working name **OGAmp**
- client-hosted static audio assets
- YouTube/video links
- Spotify, Apple Music, YouTube, and other platform links
- links to OG Blacman's channel/profile pages on music platforms
- client-provided artist photography, logo, and biography
- Tree Hugging game embedded within the site's visual shell
- scripted Clippy-style Black Buddha assistant
- Kit mailing-list signup
- future-ready merch presentation layer for Fourthwall
- future-ready event presentation layer for POSH
- analytics and tracked engagement events
- canonical SEO setup and structured metadata
- Open Graph/social preview metadata
- UAT/preview and production deployment workflows
- accessibility accommodations and reduced-motion support
- performance optimization
- automated tests for critical logic and user flows

### Explicitly deferred from V1

- live Fourthwall product catalog or checkout integration
- live POSH event/ticket integration
- CMS/admin interface
- user accounts
- custom ecommerce backend
- custom ticketing backend
- AI-powered Black Buddha
- persistent Black Buddha conversation history
- server-side user data storage
- online game leaderboard
- multiplayer game functionality
- persistent Tree Hugging game progress
- player shuffle/repeat controls
- complex desktop/operating-system simulation
- built-in social sharing/upload APIs

---

## 5. Information Architecture

### Primary experience

The main site is a single-page experience at `/` with sections such as:

- Hero / OG Blacman identity
- Featured latest release
- Music / release carousel
- Tree Hugging game
- Artist bio and photography
- Video / YouTube
- Shows / Events
- Merch
- Mailing-list signup
- Social links / music-platform links
- Footer / legal links

Exact section ordering is a design-phase decision and may be adjusted based on visual references and content density.

### Routes

Required route classes:

- `/` — primary single-page artist experience
- `/music/:slug` or `/releases/:slug` — deep-linkable release detail pages
- `/privacy` — privacy/marketing information as needed
- optional `/404` or static-host-compatible fallback behavior

The Tree Hugging game remains inside the main site experience rather than becoming a visually separate application. It may have an anchor/deep-link such as `/#game` if useful.

### Static deep-linking requirement

Because release routes need reliable canonical URLs and social previews while the site remains statically hosted, the build should support **build-time prerendering/static generation for known routes** rather than relying solely on client-side metadata updates.

Codex should select the least-complex Vue/Vite-compatible approach that:

- emits static output
- supports known release routes at build time
- produces route-specific metadata in generated HTML
- remains portable across static hosts
- does not require a persistent application server

---

## 6. Core Technology Direction

- **Vue 3**
- **Vite**
- **TypeScript**
- **Vue Router** for release routes and navigation
- **Pinia** for shared interactive state
- custom CSS and custom Vue components
- no general-purpose UI component library unless a narrow dependency has clear value
- static build output
- initially deployed to Vercel
- source stored in a private repository in the developer's GitHub account

### Dependency philosophy

Prefer native browser capabilities and small focused dependencies. Avoid large libraries when custom implementation is straightforward, particularly for visual UI that will be heavily customized.

---

## 7. Content Architecture

Content is developer-managed after launch. No CMS is required.

Use centralized typed data/config modules for editable content. Exact file structure is left to Codex, but the content model should separate data from presentation.

Suggested domains:

- artist profile
- social links
- streaming-platform links
- releases/songs
- video links
- events
- merchandise
- Black Buddha dialogue/lore
- navigation
- global site settings

### Release data should support

At minimum:

- slug
- title
- release date
- featured/current-release flag
- cover artwork
- audio asset
- optional description/post content
- optional lyrics or lyric excerpts supplied by client
- YouTube/video link
- Spotify link
- Apple Music link
- other platform links
- social share title/description/image

### Event data should support Phase 2

- title
- date/time
- venue
- city/state
- artwork
- description
- external ticket URL
- provider identifier, normally POSH for client-managed events

Events may be an empty collection at launch.

### Merchandise data should support Phase 2

- title
- image(s)
- price/display price
- description
- external Fourthwall product/checkout URL
- availability/status

Products may be an empty collection at launch.

---

## 8. Visual and Interaction Direction

The final visual theme is intentionally **not yet locked**. Client design references are still pending.

Do not hard-code the architecture around Windows XP, Y2K, or any other preliminary theme direction.

Build the visual layer so theme decisions can be expressed through reusable design tokens and component styling without restructuring the application.

### Confirmed visual principles

- mobile-first composition
- memorable, unusual, artist-specific presentation
- pixel-art motifs throughout the main site, not only inside the game
- Black Buddha rendered as a pixel-art character
- chunky/pixel-art OG avatar in the game
- important interactive states designed for portrait screenshots/screen recordings
- OG's name and/or logo should naturally appear in high-value captured states
- desktop may use increased whitespace, layered panels, floating elements, or richer positioning, but navigation must remain clear
- avoid making the desktop experience a literal operating-system simulation

### Social capture principle

A user should be able to record a 5-15 second interaction and produce something that already feels like OG Blacman content without needing editing.

Priority capture moments include:

- Tree Hugging transformation
- completed giant happy tree
- Black Buddha popups/dialogue
- OGAmp player while music is playing
- visually distinctive release states

No built-in share API is required in V1.

---

## 9. OGAmp Persistent Music Player

Create a custom Winamp-inspired player with an OG Blacman-specific identity. **OGAmp** is the current working name and may change during design.

### Required controls

- Play / Pause
- Previous track
- Next track

No shuffle or repeat controls are required for V1.

### Behavior

- fixed at the bottom of the viewport
- visually above all normal content
- persists across Vue Router navigation
- does not restart when navigating between release routes
- clearly identifies OG Blacman and/or uses the OG logo/name
- usable on small mobile screens without covering critical interaction areas
- desktop version may expand or reposition while preserving the fixed/persistent concept

### Playback state

Persist useful player state through browser storage so a refresh/return visit can restore:

- selected track
- playback position
- relevant UI state

Browser autoplay restrictions must be respected. Restoring state must not force prohibited autoplay.

### Audio delivery

- client provides 3-5 audio tracks
- audio is served as static media assets or other static/CDN-hosted files
- do not bundle audio into JavaScript
- load/preload conservatively so the player does not make the initial page unnecessarily heavy

### Layout requirement

All scrollable/page content must account for the fixed player's height and mobile safe areas so important controls/content are never permanently obscured.

---

## 10. Tree Hugging Game

The Tree Hugging game is a compact interactive centerpiece, embedded in the site's existing visual system.

### Core loop

1. OG is already positioned beside a single tree.
2. No character movement controls are required.
3. A large touch-friendly **HUG** interaction is available.
4. User presses/holds to hug.
5. Hug progress advances the tree transformation.
6. Tree grows from sapling through multiple stages into a very large tree.
7. Leaves and fruit appear as growth progresses.
8. A sad facial expression suggested by the foliage evolves into a large happy expression.
9. Final state is deliberately visually rewarding and screenshot/recording friendly.
10. User can replay/reset during the current visit.

### Game persistence

Game progress **does not persist** across refreshes or return visits.

Each fresh visit begins with the sapling.

### Dollar score

Display a dollar score in the upper-right area of the game.

At game initialization:

- determine a randomized final dollar amount between **$1,000 and $5,000**
- score should increase monotonically as the tree grows
- score progression should correspond to hug/tree progress rather than feeling completely arbitrary
- the final completed tree should land exactly on the randomized target amount

Codex may choose the exact interpolation/increment model. The user-facing effect should feel lively while remaining deterministic for the current run once the final target is chosen.

### Shareable completion state

Design the completed-game state intentionally for portrait capture. It should include:

- giant happy fruit-bearing tree
- OG avatar
- final dollar score
- recognizable OG Blacman branding/name/logo
- OGAmp still visible if practical

No generated image download or native share workflow is required for V1.

### Accessibility

Provide understandable instructions and a keyboard-operable equivalent to the hold/touch interaction where feasible, without compromising the primary mobile experience.

---

## 11. Black Buddha Assistant

V1 Black Buddha is a **scripted Clippy-style assistant**, not an AI chatbot.

### Character concept

- client-provided Black Buddha pixel artwork
- appears throughout the site
- actively initiates interactions based on site activity
- behaves more like a personality-rich assistant/guide than a generic help widget

### Knowledge/content domains

Authored Black Buddha dialogue may reference:

- OG Blacman's biography
- songs and supplied lyrics
- website navigation/content
- Chicago
- fictional Black Buddha lore

### Interaction model

Support authored triggers such as:

- initial visit
- reaching particular sections
- first song play
- game start
- game completion
- extended inactivity
- opening a release
- mailing-list interaction

Exact trigger set and dialogue are content/design decisions.

### State

Use temporary in-memory session state to avoid repetitive or excessive prompts during the current page session.

Do not store conversation/history across refreshes or return visits in V1.

### UX guardrails

- must never block critical controls
- must not continuously interrupt the user
- implement cooldown/dismissal behavior
- allow user to close/dismiss the assistant
- respect reduced-motion preferences
- reposition appropriately around OGAmp and game UI

### Future expansion

Architect the scripted dialogue/trigger content cleanly enough that a future Phase 2 could add:

- deeper branching text RPG behavior
- optional AI chatbot capability

Do not introduce AI/API/backend complexity in V1 merely to prepare for this possibility.

---

## 12. Music and Release Experience

### Featured release

The current/latest release receives prominent homepage placement.

It should support:

- cover art
- title
- descriptive/release content
- immediate OGAmp playback
- YouTube/video link
- Spotify link
- Apple Music link
- other supplied platform links
- link to its deep release page

### Release carousel

Homepage should feature approximately 3-5 releases.

Each release should link to a dedicated route and expose relevant streaming/video actions.

### Release routes

Each release page should:

- preserve the global site shell and OGAmp
- use the same visual system as the homepage
- provide a canonical deep link
- provide unique page title/description
- provide unique Open Graph/social preview metadata
- expose release-specific artwork and platform links

---

## 13. Video and Platform Links

The site should:

- link to OG Blacman's YouTube channel
- link to specific videos from relevant release content
- link to Spotify, Apple Music, YouTube, and other supplied artist/channel pages
- track outbound platform interactions in analytics

Do not build a custom video hosting system.

---

## 14. Mailing List / Kit

Use **Kit** for V1 mailing-list management.

### Form requirements

- email: required
- first name: optional
- inline validation
- inline success state
- inline error state
- no redirect to a generic provider confirmation page during the primary signup flow where avoidable
- visually integrated with the site's custom design

### Segmentation

Keep V1 simple. No source-specific tagging/segmentation requirements are needed initially.

### Marketing language

Signup wording should be broad enough to reflect the client's intended OG Blacman marketing use, including music, events, merchandise, and related OG Blacman projects.

If the client later intends to use the list for broader label/cross-artist marketing, consent/copy should be reviewed before that use is enabled.

### Architecture

Prefer an integration method compatible with static hosting and custom styling. Do not expose private API credentials in browser code.

If Kit's public form/embed endpoint is sufficient, use it directly. Add a serverless/backend endpoint only if required by the final Kit integration and keep that concern isolated from the rest of the app.

---

## 15. Merchandise / Fourthwall, Phase 2

Fourthwall is the planned commerce/merchandise platform.

No products exist at launch, so live commerce is not a V1 blocker.

### V1

- create a merch section/component capable of a branded empty/coming-soon state
- optionally use the empty state to support general mailing-list growth
- define content models/components so future products can be added without redesigning the site

### Phase 2

When products exist:

- present products using custom OG Blacman components on `ogblacman.com`
- delegate transaction/checkout/fulfillment to Fourthwall
- keep commerce-provider-specific logic isolated behind simple external links or a narrow integration layer
- avoid rebuilding product/inventory/order management in the Vue app

---

## 16. Events / POSH, Phase 2

POSH is the planned ticketing platform for OG Blacman-managed events.

No current ticketed events need implementation at launch.

### V1

- create an Upcoming Shows / Events component
- support an empty state when no events exist
- keep event content in centralized typed data
- allow each event to define its own external ticket URL

### Phase 2

For OG-managed events:

- present event details using custom OG Blacman UI on `ogblacman.com`
- use POSH as the ticketing destination/provider
- track outbound ticket clicks

If a venue/promoter controls ticketing for a particular show, the event model must be able to link to that external provider instead without code changes to the presentation layer.

---

## 17. State Management

Use Pinia for shared application state where it materially simplifies coordination.

Expected shared state domains include:

- OGAmp playlist/current-track/playback UI state
- Black Buddha session state and trigger history
- selected release/navigation context if useful
- global interaction/UI state shared between sections/routes

Keep Tree Hugging gameplay state local to the game feature unless there is a concrete reason for global state.

Do not place static content in Pinia when typed content modules are sufficient.

---

## 18. Analytics

Use **Google Analytics 4 (GA4)** for V1.

Reasons for this choice within this project:

- no additional paid analytics subscription required for the intended use
- supports custom interaction events
- supports scheduled email delivery of standard/custom reports to client recipients
- keeps analytics independent of the static hosting provider

### Minimum tracked events

- page view / route view
- release detail view
- song played
- streaming-platform click
- video click
- mailing-list signup success
- game started
- game completed
- Black Buddha opened/engaged
- merch click
- ticket click
- social-profile click

Codex should define a small analytics abstraction so application code does not scatter direct GA implementation calls everywhere.

### Privacy

Do not collect unnecessary personally identifying analytics data. Mailing-list submission data belongs in Kit, not GA.

Include a privacy page and make analytics/marketing behavior configurable enough to adapt if consent requirements change.

---

## 19. SEO and Social Metadata

Treat `ogblacman.com` as OG Blacman's canonical official website.

### Site-wide requirements

- semantic titles and descriptions
- canonical URLs
- sitemap
- robots configuration
- favicon/app icons
- Open Graph metadata
- social sharing image defaults
- appropriate structured data for artist/music/release information

### Release-specific requirements

Each deep release route should have build-time output containing:

- unique title
- unique description
- canonical URL
- release artwork/social image
- release-specific Open Graph data
- relevant structured data

This is a key reason to prerender/static-generate release routes instead of depending entirely on runtime SPA metadata.

---

## 20. Accessibility

Target **WCAG 2.2 AA as a practical design goal for conventional site content and controls**, while preserving the visual/interactive identity of the project.

Priorities:

- semantic HTML
- keyboard-accessible navigation and controls
- visible focus indicators
- sufficient text/control contrast
- accessible names for icon-only controls
- meaningful image alt text
- captions/accessible handling for embedded video where available
- form labels and validation messaging
- no essential information conveyed solely through color
- touch target sizing appropriate for mobile
- reduced-motion support

### Reduced motion

When `prefers-reduced-motion` is enabled:

- suppress or simplify nonessential movement
- avoid animated Black Buddha entrance paths
- reduce large movement/transformation effects where possible
- preserve all content and interaction outcomes

The Tree Hugging game may still visually change state, but animation between states should be simplified.

---

## 21. Performance Budget

Performance matters because the site is expected to receive mobile traffic from social-media links and includes photography, audio, pixel art, animation, and game assets.

### Goals

On representative modern mobile hardware/network conditions:

- target LCP at or below ~2.5s
- target INP at or below ~200ms
- target CLS at or below ~0.1
- keep the initial JavaScript payload conservative
- avoid loading all audio files eagerly
- lazy-load noncritical images/video embeds
- defer game-specific assets until near/when the game is needed if beneficial

### Asset strategy

- responsive images
- modern compressed image formats where appropriate
- explicit dimensions/aspect ratios to reduce layout shift
- static audio loaded separately from JS
- lazy video embeds/thumbnails where possible
- optimize pixel-art assets without introducing blur
- avoid heavy animation libraries unless justified by the final design

Codex should propose specific measurable bundle/image budgets once the initial visual assets are known.

---

## 22. Responsive Behavior

### Mobile

Primary design target.

- portrait-first
- touch-first controls
- fixed OGAmp accommodates mobile browser safe areas
- Black Buddha avoids overlapping critical controls
- game fits comfortably within the viewport width
- no hover dependencies
- content should remain legible in screen recordings

### Desktop

Desktop should feel intentionally composed rather than merely stretched.

Possible enhancements:

- wider release layouts
- richer layered positioning
- additional decorative pixel-art elements
- floating/panel-like compositions
- more breathing room around photography and player UI

Do not create a desktop-only navigation paradigm that differs fundamentally from the mobile site's information architecture.

### Required browser targets

- Safari on current iOS
- Chrome on current iOS/Android
- Chrome desktop

Other modern browsers should receive reasonable standards-based compatibility but are not primary QA targets for launch.

---

## 23. Testing Strategy

Use focused automated testing rather than pursuing exhaustive coverage.

### Unit/component logic

Use **Vitest** for logic with meaningful regression risk, particularly:

- OGAmp track navigation/state helpers
- game score/progression calculations
- Black Buddha trigger/cooldown logic
- content/data validation helpers
- analytics abstraction where testable

### End-to-end

Use **Playwright** for critical user flows at representative mobile and desktop viewports.

Minimum flows:

1. Home loads and primary artist/release content is visible.
2. User starts a song, navigates to a release route, and player state persists.
3. User completes the Tree Hugging game and receives the final tree/score state.
4. Black Buddha trigger appears, can be dismissed, and does not block primary navigation.
5. Mailing-list form validates and handles mocked/test success/error responses correctly.
6. Release deep link loads directly rather than only after SPA navigation.

### Visual smoke coverage

Capture selected Playwright screenshots for key mobile and desktop states to catch major layout regressions, especially:

- homepage hero
- OGAmp
- game completion state
- Black Buddha popup
- release page

Do not build a large visual-regression infrastructure unless the project later needs it.

---

## 24. Environments, Git, and Deployment

### Repository

- private GitHub repository owned by developer
- atomic commits
- commit messages should describe one logical change
- avoid large mixed-purpose commits

### Branch model

At minimum:

- `main` — production
- `uat` — stable client UAT/test/preview environment
- short-lived feature branches as needed

### Deployment model

- `main` deploys to the live production site at `ogblacman.com`
- `uat` deploys to a stable preview/UAT URL
- feature branches/PRs may receive ephemeral preview deployments if supported by the selected static host

Do not make application code depend on preview-deployment vendor APIs.

### Environment configuration

Use environment variables only for environment-specific public configuration such as:

- GA measurement ID
- Kit form identifier/endpoint
- canonical site URL
- environment label

No private secrets should be present in the static frontend bundle.

---

## 25. Implementation Phases

Each phase should be implemented through small, atomic commits. Codex should expand these into concrete tasks and acceptance criteria.

### Phase 0: Planning and content inventory

- validate client assets
- confirm release list and URLs
- confirm final launch content
- establish typed content models
- record pending design references
- confirm deployment environments

### Phase 1: Foundation

- Vue/Vite/TypeScript project setup
- routing
- Pinia
- global layout
- design-token foundation
- responsive shell
- static/prerender strategy for release routes
- UAT/production deployment pipeline
- baseline SEO structure

### Phase 2: Artist content and release system

- hero/identity
- artist bio/photos
- latest release
- release carousel
- release detail routes
- platform/social links
- video links
- typed local content data

### Phase 3: OGAmp

- player UI
- play/pause
- previous/next
- persistent route-level state
- browser-state restoration
- static audio loading strategy
- fixed responsive positioning
- analytics hooks

### Phase 4: Tree Hugging game

- OG pixel avatar integration
- tree stage system
- hold-to-hug interaction
- progress behavior
- randomized $1,000-$5,000 final score
- stage-correlated score progression
- sad-to-happy foliage face progression
- fruit/leaves growth
- replay/reset
- portrait shareable completion composition
- accessibility/reduced-motion behavior
- analytics hooks

### Phase 5: Black Buddha

- pixel-art character integration
- floating assistant presentation
- authored dialogue data
- activity-trigger system
- trigger cooldowns/session behavior
- dismissal/reopen behavior
- navigation/content actions where useful
- responsive collision/position logic around OGAmp/game
- analytics hooks

### Phase 6: Mailing list

- Kit integration
- first-name optional/email required form
- validation
- inline success/error states
- privacy/marketing copy
- analytics event

### Phase 7: Future commerce/events hooks

- merch empty state and typed model
- events empty state and typed model
- external URL abstraction
- Fourthwall-ready product presentation boundary
- POSH-ready ticket-link boundary
- no live commerce/ticketing required

### Phase 8: Analytics, SEO, and social metadata

- GA4 setup
- custom event abstraction
- event instrumentation
- scheduled client report setup outside app code
- sitemap/robots/canonicals
- per-release Open Graph output
- structured data
- social preview testing

### Phase 9: Accessibility, performance, and QA

- keyboard/focus pass
- reduced-motion pass
- mobile safe-area pass
- image/audio optimization
- lazy loading
- automated tests
- mobile device/browser QA
- desktop Chrome QA
- direct deep-link QA
- UAT review

### Phase 10: Production launch

- production content freeze
- final client-provided assets
- DNS/domain validation
- production deployment
- analytics validation
- Kit signup validation
- metadata/social-preview validation
- final mobile smoke test

---

## 26. UAT / Acceptance Priorities

Before production launch, confirm:

- OG branding is immediately recognizable on mobile
- main experience is comfortable in portrait orientation
- latest release and 3-5 releases are correct
- release deep links work when opened directly
- OGAmp survives route navigation
- player controls work with supplied audio
- fixed player does not cover important content
- Tree Hugging game completes reliably
- final dollar score stays within $1,000-$5,000 and tracks growth
- final tree state is visually suitable for screen recording/screenshotting
- Black Buddha triggers feel intentional rather than disruptive
- Black Buddha can always be dismissed
- Kit signup works and confirms inline
- analytics events fire as expected
- OG name/logo is present in important captured states
- layout works in target mobile browsers and desktop Chrome
- reduced-motion mode remains usable
- no placeholder/client-private content remains
- canonical/social metadata uses production URLs

---

## 27. Post-Launch / Phase 2

Potential follow-up work should be estimated separately from the launch build.

### Fourthwall

- create/configure client Fourthwall account when merch exists
- add live product data
- connect custom merch cards to Fourthwall transactions
- track merch conversions/outbound interactions where practical

### POSH

- create/configure client POSH presence when OG-managed events exist
- add event data
- connect custom event cards to POSH ticket pages
- track ticket CTA interactions

### Black Buddha expansion

Possible later directions:

- larger branching text RPG
- richer site-state reactions
- optional AI chat

AI chat would require a separately scoped backend/API layer, usage controls, moderation/safety behavior, cost monitoring, and additional QA.

### Additional growth features

Possible later additions:

- richer mailing-list segmentation
- merch-drop-specific signup flows
- Chicago event-specific signup flows
- additional release templates
- additional games/interactions
- expanded video/gallery content
- more automated client reporting

---

## 28. Remaining Client Inputs

Implementation can begin before every design decision is resolved, but the following inputs remain required or useful:

- final design reference samples
- final logo files
- approved artist photos
- approved bio
- featured release content
- 3-5 launch song entries
- audio files
- cover art
- Spotify/Apple Music/YouTube/other platform URLs
- song-specific video URLs
- optional lyrics/lyric excerpts for release content and Black Buddha dialogue
- approved Black Buddha lore/dialogue direction
- final mailing-list signup wording
- privacy/contact information
- launch date/content freeze date

---

## 29. Constraints for Codex

When expanding this plan into implementation details, Codex should:

- preserve the static-hosting requirement
- keep hosting-provider-specific logic out of the application where possible
- prefer build-time prerendering for release routes and metadata
- keep content data centralized and typed
- keep external providers behind narrow integration boundaries
- avoid introducing a CMS
- avoid introducing backend infrastructure for V1 unless a required third-party integration cannot work securely without it
- keep OGAmp outside individual route views so playback survives route navigation
- keep Black Buddha V1 deterministic/scripted
- keep game state ephemeral
- keep the game simple enough to remain a polished centerpiece rather than expanding into a larger game project
- implement accessibility and reduced-motion as part of components rather than as a final patch
- optimize for mobile portrait first
- prioritize visually strong, capture-friendly interaction states
- use atomic commits throughout implementation
- propose detailed tasks, dependencies, and acceptance criteria per implementation phase before coding begins

---

## 30. Definition of V1 Success

V1 is successful when a visitor arriving from social media can quickly understand who OG Blacman is, hear his music, explore several releases, encounter memorable interactive personality through Black Buddha, play and complete the Tree Hugging game, join the mailing list, and follow OG on external platforms.

The experience should feel distinctive enough that recording or screenshotting the site produces recognizable OG Blacman content, while the underlying architecture remains simple, maintainable, statically deployable, and ready for Fourthwall merchandise and POSH ticketing when those business needs become real.
