# Vue Content Architecture Plan

## Goal

Replace the raw `reference-body.html`/`v-html` page with real Vue components. Move every editable text value, link, link title, image URL, responsive image source, video poster/source, form label, placeholder, status message, and accessibility string into `src/content/site.yaml`.

The desktop page and mobile slider keep their distinct layouts but consume the same content object. Expandable collections such as the logo carousel, case studies, clients, and social links render with `v-for`.

## Content model

Create `src/content/site.yaml` with these top-level groups:

- `accessibility`: slider-dot label template and media accessibility strings.
- `shared`: reusable arrow, texture, and other decorative images.
- `social_links`: stable ID, label, URL, optional link title/target, and responsive icon data.
- `sections`: hero, about, why, how, studios, clients, and contact content. Each section owns headings, copy, CTAs, responsive media, and any section-specific arrays such as copy columns.
- `case_studies`: section heading plus expandable items with stable ID, title, year, URL, and link title.
- `clients`: section heading plus expandable items with stable ID, visible label, URL, and link title.
- `carousel`: expandable image entries with stable ID, responsive image metadata, and an optional link.
- `form`: fields, required marker, submit/wait text, success/error text, and validation-facing labels.
- `footer`: copyright text.

Image objects support `src`, `alt`, optional `sizes`, and optional `sources` entries containing `src` and `width`. Video objects support `poster` and `sources` entries containing `src` and MIME `type`. Link objects consistently support `url`, visible `label`, optional `title`, `target`, and `rel`.

## Vue architecture

- `App.vue` imports validated content and renders the grain overlay, `DesktopExperience`, and `MobileExperience`. Remove `v-html`, raw HTML imports, global DOM queries, and manual behavior setup.
- `DesktopExperience.vue` preserves the current desktop structure and composes reusable content components.
- `MobileExperience.vue` defines the ordered mobile slides and passes them through `MobileSlider.vue`.
- Shared components:
  - `AppLink.vue`
  - `SectionHeading.vue`
  - `ResponsiveImage.vue`
  - `BackgroundVideo.vue`
  - `SocialLinks.vue`
  - `LogoCarousel.vue`
  - `CaseStudyList.vue`
  - `ClientList.vue`
  - `ContactForm.vue`
  - `MobileSlider.vue`

Keep existing semantic CSS classes and grid IDs so the current consolidated stylesheet remains applicable. Add only carousel item/image styles and remove obsolete `js-*` behavior hooks once the behavior is component-owned.

## Component behavior

- `MobileSlider` owns active slide state, dots, arrows, keyboard navigation, wheel throttling, touch gestures, `aria-hidden`, and `inert` through Vue state and events.
- `ContactForm` owns validation and submitted/success state without manually hiding queried elements.
- `LogoCarousel` renders `carousel.items`, starts its animation with a component-local intersection observer, and cleans up the observer on unmount.
- `BackgroundVideo` renders poster/source attributes from one media object, enforces muted inline playback, and attempts autoplay on mount.
- `AppLink` renders optional links consistently and adds `noopener noreferrer` for `_blank` links.
- Desktop and mobile case/client/social instances use the same YAML arrays rather than duplicated markup.

## Loading and validation

- Add `yaml` as a direct dependency.
- Import `site.yaml?raw` in `src/content/loadContent.js`, parse it, validate required objects/arrays/fields, and export the content object.
- Validation reports precise paths, rejects duplicate collection IDs, and permits intentionally absent optional links.
- Keep CSS classes, DOM IDs, and presentation-only structure out of YAML.

## Verification

- Add a content test that parses and validates the real YAML and checks expandable collection rendering inputs.
- Update the browser interaction test for component-owned slider and form behavior.
- Run `npm run test:content`, `npm run build`, and `npm run test:interaction`.
- Confirm no editable text, `href`, image `src`/`srcset`, poster, or media source remains hardcoded in Vue templates.
- Do not run the visual suite without explicit user approval.

## Defaults

- Background-video posters and source URLs are editable YAML content.
- Desktop and mobile share content values; layout differences remain in Vue components.
- All current placeholder values seed the YAML so content can be replaced incrementally.
- The logo carousel starts with an empty `items` array because the current markup contains only a placeholder comment; adding an item requires only a YAML entry.
- Existing CSS remains global during this migration to minimize unrelated visual changes.
