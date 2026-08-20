# Respective Collective reference audit

Reference: `https://www.respectivecollective.com/`  
Audited: 2026-08-19/20

## Page inventory

Desktop/tablet order:

1. Full-viewport looping video hero with Respective Collective lockup, “WE CREATE FOMO,” arrow, and four social links.
2. “who we ARE” two-column copy/team-photo section.
3. “WHY Respective?” copy section.
4. “HOW it works” three-column process section.
5. Full-bleed moving campaign-image strip.
6. “case STUDIES” list with client/year hover rows.
7. “Respective studios” copy and work link.
8. “BRANDS we’ve worked with” four-column link list.
9. “Whats up?” contact form and copyright footer.

Below 480px the page switches completely to eight fixed full-viewport slides: hero, who we are, why, how it works, case studies, brands, studios, and contact.

## Exact breakpoints and behavior

- Main: `min-width: 992px`
- Medium: `768px–991px`
- Small: `480px–767px`
- Tiny/mobile slider: `max-width: 479px`
- Mobile slide transition: 300ms, `ease-in-out`, infinite wrap.
- Vertical mobile swipes map to previous/next horizontal slides; horizontal swipes, wheel, arrow keys, and dot controls are also supported locally.
- Desktop campaign strip starts when it enters the viewport, moves from `0px` to `-400px` over 60 seconds, returns to `0px` over 60 seconds, and loops linearly.
- Forms are intercepted locally and show the original success state without sending data to the production site.

## Typography

Exact downloaded font files:

- Quinn: `67587c0a4e4d90fd75494911_Quinn-Bold.ttf`
- Betterworks: `67587c2319f26f185bf4ab1c_Betterworks.otf`
- Respective: `677d78f379e15f7e9bbcde09_Respective.otf`
- Neue Haas Display: Roman, Medium, Light, Thin, XThin, XXThin, Bold, Black, and the corresponding italic files in `public/assets/reference/`.

The original CSS font declarations, weights, sizes, line heights, gradient text clipping, and responsive overrides are preserved in `src/styles/reference.css`.

## Assets

`public/assets/reference/` contains 120 exact public production assets (about 138 MB):

- Desktop and mobile hero video/poster sets.
- All mobile slide video/poster sets in MP4 and WebM.
- Team photo and every original responsive srcset rendition.
- All campaign-strip images and responsive renditions.
- Gradient textures (`RGRAD.jpg`, `RGRAD2.jpg`).
- Grain GIF/WebP textures.
- Arrow, favicon, app icon, and social icon assets.
- All font files declared by the production stylesheet.

`public/assets/reference/mapping.json` records production URL-to-local-path mappings.

## Validation measurements

| Viewport | Reference page height | Local page height | Experience |
|---|---:|---:|---|
| 1440×900 | 7868px | 7868px | Desktop |
| 1280×800 | 7842px | 7842px | Desktop |
| 768×1024 | 9214.78125px | 9214.78125px | Medium/tablet |
| 390×844 | 844px | 844px | Fixed mobile slider |

All recorded section boundaries, widths, grid sizes, and page heights match the reference audit. Final viewport-clipped raster mismatches are 6.95%, 6.05%, 8.49%, and 0.00%, respectively; the desktop/tablet diff images locate the meaningful changed pixels in independently playing hero-video frames. Static geometry, typography, imagery, section boundaries, and the mobile capture overlay.

Reference captures, local captures, computed-style data, and diff reports are stored under `tests/visual/`.
