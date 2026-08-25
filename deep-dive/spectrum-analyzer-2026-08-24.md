# Spectrum Analyzer Performance Audit

Date: 2026-08-24
Branch: `feature/custom-telephone-player`

Implementation status: completed on this branch. The render loop is capped at 30 fps, bars are batched by color band, canvas and frequency metadata are cached, the audio context is suspended between playback sessions, and an `IntersectionObserver` pauses visualization work while the player is offscreen.

## Overview

The spectrum analyzer is already modest: it renders into a 20×20 canvas, reuses its frequency buffer, creates the Web Audio graph only after a user gesture, and does not update React state per animation frame. The best performance gains are therefore in render cadence, canvas batching, and audio-context lifecycle—not in reducing the canvas resolution or introducing heavier infrastructure.

## Current execution path

1. Playback lazily creates an `AudioContext`, `MediaElementAudioSourceNode`, and `AnalyserNode` with an FFT size of 64.
2. A `requestAnimationFrame` loop samples 32 frequency bins and reduces them to 10 bars.
3. Each bar is drawn as individual 1×1 colored blocks, for as many as 180 `fillRect` calls per frame.
4. The 20×20 canvas is enlarged with CSS and `image-rendering: pixelated`.
5. Stopping playback cancels animation, but the audio context remains running until the component unmounts.

## Highest-value improvements

| Priority | Finding | Recommendation | Risk |
| --- | --- | --- | --- |
| 1 | The visual loop runs at the display refresh rate even though the block analyzer and `smoothingTimeConstant: 0.78` do not need 60–144 updates per second. | Keep `requestAnimationFrame`, but gate drawing with its timestamp to approximately 30 fps. This preserves browser scheduling and halves drawing at 60 Hz, cuts it 75% at 120 Hz, and cuts it about 79% at 144 Hz. | Low |
| 2 | Stopping playback cancels canvas work but leaves the Web Audio context running. | Call `audioContext.suspend()` when playback stops or ends. The existing preparation path already resumes a suspended context. Do not close and recreate it for each play cycle. | Low |
| 3 | Drawing separate pixels produces up to 180 canvas calls and repeated `fillStyle` changes per rendered frame. | Since equal-colored blocks are contiguous, draw at most three vertical rectangles per bar—green, gold, and red—while preserving the same pixelated result. That caps drawing at 30 `fillRect` calls per frame. | Low |
| 4 | The loop repeatedly retrieves the 2D context and recalculates fixed frequency-bin ranges. | Cache the `CanvasRenderingContext2D` in a ref and precompute the 10 bin ranges when the analyzer is created. | Low; small individual gain |
| 5 | Audio may appropriately continue while the player is offscreen, but the visualization need not. | If profiling still shows meaningful cost, use an `IntersectionObserver` to pause only the visual loop while the phone is outside the viewport. Resume drawing when it re-enters. | Moderate |

## Upper-bound work reduction

These figures are arithmetic estimates from the current loop, not measured benchmarks:

- Current worst case at 60 Hz: 180 canvas fills × 60 frames = 10,800 `fillRect` calls per second.
- With 30 fps throttling and batched color segments: at most 30 fills × 30 frames = 900 calls per second.
- This is more than a 90% reduction in worst-case canvas calls, plus fewer frequency samples and loop iterations.
- Suspending the audio context removes avoidable Web Audio processing after a manual stop or natural track end; the power benefit should be verified with browser performance tooling because it depends on the browser and device.

## Existing choices worth keeping

- Frequency data is stored in a ref and allocated once rather than once per frame.
- React state is not updated from the analyzer loop.
- The audio graph is initialized lazily after user interaction.
- Animation is canceled whenever playback stops and on component unmount.
- Audio nodes are disconnected and the context is closed on unmount.
- A tiny intrinsic canvas enlarged with CSS is well suited to this intentionally pixelated visual.

The playback time display does trigger React rendering through `timeupdate`, but only a few times per second. It is not a likely bottleneck and should not be optimized before the analyzer loop.

## Changes to avoid

- `OffscreenCanvas`, a worker, or an `AudioWorklet`: coordination and serialization complexity outweigh the work performed by a 20×20 display.
- Closing and rebuilding the audio context every time playback stops: this adds allocations and increases restart latency.
- Reducing the FFT size below 64: the current 32 bins are already sparse for 10 visual bars, so the saving is negligible and spectrum quality would suffer.
- Replacing the canvas with DOM elements: it would move work into style and layout without improving the audio analysis.

## Recommended implementation sequence

First add the 30 fps gate and suspend/resume lifecycle. Then batch each bar into color segments and cache the context and bin map in the same focused change. Add offscreen visibility pausing only if profiling on a representative phone still identifies the analyzer as material.

Relevant code: `src/components/TopPickRelease.jsx`, `src/styles/runtime.css`, and `tests/interaction.mjs`.
