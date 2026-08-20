# Exact Respective Collective Clone Plan

Build an exact, pixel-for-pixel clone of:

https://www.respectivecollective.com/

## Technology requirements

- Vue 3
- Vite
- JavaScript, not TypeScript
- Plain CSS unless the reference site demonstrably requires another approach

This is a fidelity task, not a redesign. Do not reinterpret, modernize, simplify, improve, embellish, or “take inspiration from” the reference.

## Non-negotiable requirements

### 1. Inspect the live website before writing implementation code

- Use browser automation and screenshots.
- Inspect the DOM, loaded stylesheets, computed styles, responsive breakpoints, fonts, images, videos, SVGs, spacing, positioning, effects, transitions, and animations.
- Capture full-page reference screenshots at 1440×900, 1280×800, 768×1024, and 390×844.
- Record exact dimensions and computed typography for every section.

### 2. Preserve the original exactly

- Use the exact visible text and capitalization.
- Use the exact fonts, font files, weights, letter spacing, line heights, and text transformations.
- Preserve the original oversized section-heading scale. Do not apply arbitrary `max-width`, `max-font-size`, or conservative `clamp()` values.
- Preserve all title gradients, colors, overlays, textures, and blend modes.
- Preserve exact image crops, aspect ratios, object positions, filters, and layering.
- Preserve the page’s intentional whitespace, asymmetry, clipping, overflow, and unusual proportions.
- Match the original section heights, spacing, grid structure, and alignment.
- Reproduce its responsive behavior instead of inventing new mobile layouts.

### 3. Assets must be exact

- Download and store the reference site’s actual publicly loaded images, SVGs, videos, and font assets locally in the project when legally permitted.
- Do not substitute AI-generated images, stock photos, placeholder assets, emoji, generic icons, or CSS approximations.
- Do not recreate image-based graphics as plain text.
- Do not replace an unavailable font with Impact, Arial, a system font, or a “similar” typeface.
- If an essential asset or font cannot be accessed or legally used, stop and explain exactly what is missing. Do not silently substitute anything.

### 4. Reproduce behavior

- Match navigation, scrolling, hover states, marquees, image changes, transitions, reveals, forms, and responsive interactions.
- Match animation timing, easing, direction, delay, and transform origin.
- Keep local form behavior safe; do not submit information to the production website.

### 5. Do not invent content

- No fabricated campaign statistics.
- No additional headings, labels, captions, footer text, or navigation items.
- No rewritten marketing copy.
- No “concept clone” disclaimer inside the rendered page.
- Do not omit sections because they are difficult.

## Required workflow

### Phase 1 — Reference audit

- Inspect the complete live page.
- Produce a concise internal inventory of every section, asset, font, breakpoint, and interactive behavior.
- Identify the exact production asset URLs and font declarations.
- Do not implement until this audit is complete.

### Phase 2 — Implementation

- Build the page in Vue/Vite using maintainable components.
- Match the reference’s rendered output, not merely its semantic structure.
- Preserve exact visual values whenever they can be measured.
- Avoid approximations such as “roughly similar,” guessed spacing, or generic design tokens.

### Phase 3 — Visual-difference validation

- Run the local app.
- Capture screenshots at the same viewport sizes as the reference.
- Compare local and reference screenshots using overlays or pixel-difference tooling.
- Iterate section by section until major geometry, typography, imagery, colors, and spacing align.
- Check the hero, every oversized heading, image crop, and section boundary individually.
- A successful build is not sufficient; visual comparison is mandatory.
- Do not stop after one screenshot pass.

## Acceptance criteria

- No substituted fonts or images.
- No altered wording or capitalization.
- No noticeably changed font sizing, spacing, colors, gradients, or image crops.
- No missing sections or interactions.
- No horizontal overflow unless the reference intentionally has it.
- Desktop and mobile screenshots closely overlay the reference.
- `npm run build` completes successfully.
- The browser console contains no application errors.

If the existing repository contains a previous approximate implementation, replace or refactor it as needed. Do not preserve incorrect styling merely because it already exists.

## Final report

Before finishing, report:

- Files created or changed.
- Exact assets and fonts obtained from the reference.
- Viewports tested.
- Remaining visual differences, if any.
- Build and browser-validation results.

Do not claim the clone is complete while known visual differences remain. If exact reproduction is blocked, explain the blocker instead of producing an approximation.
