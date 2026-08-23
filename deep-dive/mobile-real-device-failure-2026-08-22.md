# Mobile real-device failure audit

## Overview

The mobile implementation is substantially heavier on a physical phone than its
single visible slide suggests. All six slides mount at startup. That eagerly creates
six WebGL renderers, starts six looping videos, and initializes the audio-player path,
even though five slides are hidden. A desktop browser's responsive viewport changes
layout dimensions, but it still uses the laptop's GPU, memory, and media decoders, so
it does not reproduce this failure mode.

There is also a definite breakpoint gap: Vue selects the mobile experience through
767px, while CSS keeps that experience hidden from 480px through 767px. In that range
the desktop experience has been unmounted and the mobile experience is `display:none`,
so the page is blank.

## Findings

### 1. All mobile media and WebGL contexts are eager

`MobileExperience.vue` renders all six slides at once. `aria-hidden`, `inert`,
`visibility:hidden`, and transforms change presentation, but do not unmount Vue
components or release GPU/media resources.

- Each `SectionHeading` mounts one `GoldenText`, producing six independent WebGL
  renderers on mobile.
- Each `BackgroundVideo` calls `video.play()` during mount, producing six simultaneous
  looping video playback attempts.
- This is the most likely explanation when the tab reloads, crashes, goes black, or
  becomes unresponsive only on a physical phone.

### 2. Failed WebGL has no visible fallback

`SectionHeading.vue` always hides its ordinary text with `opacity: 0`. The installed
Three.js renderer is WebGL 2-only, and `golden-text` constructs it synchronously without
a local error boundary. If an older iOS device lacks the required context, or Safari
refuses another context under resource pressure, the title stays invisible and the
component can throw during mounting.

The correct fallback is to leave the HTML label visible until `GoldenText.ready`
resolves, and keep it visible when WebGL creation fails.

### 3. The JavaScript and CSS breakpoints disagree

`App.vue` mounts `MobileExperience` at widths up to 767px. In `reference.css`,
`.site--mobile` is hidden through 767px and only becomes visible at 479px and below.
Widths from 480px through 767px therefore render neither experience. This can affect
small phones in landscape, accessibility zoom, embedded browsers, and compact tablet
layouts.

### 4. Older Safari APIs are assumed

`App.vue` and `TopPickRelease.vue` call `MediaQueryList.addEventListener` without the
older `addListener` fallback. `TopPickRelease.vue` and `golden-text` also assume
`ResizeObserver`. These are secondary suspects for older iOS versions; feature guards
would turn hard startup failures into controlled degradation.

### 5. Video playback failures are swallowed

`BackgroundVideo.vue` catches and discards `video.play()` rejection. Low Power Mode and
iOS autoplay policy can therefore leave a non-playing video with no diagnostic state.
The poster background reduces the visual impact, but the app provides no evidence that
this path failed.

## Relevant components

- `src/App.vue` — selects the responsive experience and owns the mismatched 767px cutoff.
- `src/components/MobileExperience.vue` — eagerly mounts every mobile slide and resource.
- `src/components/SectionHeading.vue` — creates a WebGL renderer and hides the fallback text.
- `src/components/BackgroundVideo.vue` — eagerly starts every video and suppresses errors.
- `src/components/TopPickRelease.vue` — initializes Webamp and assumes newer observer APIs.

## Recommended repair order

1. Make the CSS and JavaScript breakpoint agree.
2. Mount/render heavy slide content only for the active slide and at most its immediate
   neighbors; pause videos and destroy WebGL contexts when inactive.
3. Add an HTML-title fallback around WebGL creation and readiness.
4. Add Safari-compatible `matchMedia` and observer guards.
5. Capture the physical device model, iOS version, orientation, and visible symptom to
   confirm whether the primary trigger is the breakpoint gap or GPU/media exhaustion.
