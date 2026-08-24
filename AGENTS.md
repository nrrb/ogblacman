# OG Blacman website instructions

## Project workflow

- Use npm and preserve `package-lock.json`; do not introduce another package manager.
- Run `npm run test:content` and `npm run build` after changing Vue, JavaScript, CSS, or site content.
- After interactive or responsive behavior changes, run `npm run test:interaction` against a production preview.
- Keep editable site copy and configuration in `src/content/site.yaml`. When its structure changes, update `src/content/validateContent.js` and the content tests in the same commit.

## Design and implementation

- Preserve the mobile-first black, warm-white, and heritage-gold OG Blacman design system.
- Prefer open, typographic layouts and the existing control and border language. Do not introduce card treatments, decorative gradients, or generic third-party styling unless the user explicitly requests them.
- Preserve accessible labels, keyboard focus states, semantic controls, appropriate input types, and understandable validation or error states.
- Use the existing services and application architecture. Do not add another backend, email service, client-side secret, or production dependency without explicit approval.

## Code review rules

- Flag secrets or private credentials in client code. Safe path: use public embed identifiers only and keep secrets server-side.
- Flag hardcoded editable copy or configuration that belongs in `src/content/site.yaml`. Safe path: add the content there and validate its shape.
- Flag interactive changes that can duplicate initialization across responsive remounts. Safe path: make mount behavior idempotent and clean up listeners, observers, scripts, and external instances on unmount.
