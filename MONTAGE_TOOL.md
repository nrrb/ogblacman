# Activity-weighted montage builder

`tools/montage.mjs` turns a bank of source videos into a reproducible, rapid-cut,
silent MP4. It analyzes low-resolution proxies, selects active and usable source
windows, writes an editable manifest, and renders the selected windows from the
full-resolution originals.

The default shot-duration distribution is taken from
`public/assets/reference/hero-desktop-background.mp4`: most shots are 9–23 frames
at 30 fps, with occasional longer breathers.

## Requirements

- Node.js 20 or newer
- FFmpeg and FFprobe on `PATH`
- An FFmpeg build containing `vmafmotion`, `signalstats`, `blurdetect`, and `scdet`

No npm or Python package is required.

## Build a montage

Point `--input` at a directory containing `.mp4`, `.mov`, `.m4v`, `.webm`, or
`.mkv` files:

```bash
npm run montage -- \
  --input ./video-bank \
  --output ./public/assets/hero-montage.mp4 \
  --seed launch-01
```

The default output is 55.933 seconds, 1280×720, 30 fps, H.264, and silent. The
command also creates `hero-montage.edit.json` beside the output. Input directories
are scanned non-recursively and sorted by filename before seeded selection.

Multiple files or directories can be supplied by repeating `--input`:

```bash
npm run montage -- \
  -i ./video-bank/artist-a.mp4 \
  -i ./video-bank/artist-b.mp4 \
  -i ./additional-footage \
  -o ./public/assets/hero-montage.mp4
```

Use a different seed to create another ordering. The same inputs, analysis
settings, and seed produce the same edit.

## Analyze and edit before rendering

Generate only the manifest:

```bash
npm run montage -- \
  --input ./video-bank \
  --manifest ./edits/hero-v1.json \
  --manifest-only \
  --seed hero-v1
```

Every shot records its source, in/out points, frame count, activity score, and
timeline position. Source paths are relative to the manifest. Adjust or reorder
shots in JSON, then render the revised edit:

```bash
npm run montage -- \
  --from-manifest ./edits/hero-v1.json \
  --output ./public/assets/hero-montage.mp4
```

Pass `--overwrite` when intentionally replacing an existing output or generated
manifest.

## Selection controls

```text
--duration 30            target seconds
--cooldown 3             spacing between reused regions in each source
--max-source-share 0.30  initial per-source timeline cap
--top-fraction 0.35      sample from the top 35% of eligible windows
--analysis-fps 6         proxy samples per second
--concurrency 4          simultaneous fragment encodes
```

Lower `--top-fraction` for consistently intense footage. Raise it for more
variation. A three-second cooldown prevents adjacent selections from repeatedly
sampling the same source moment. Constraints relax progressively only when the
bank is too small to satisfy them.

## Activity analysis

Each proxy frame contributes:

- VMAF motion score;
- luminance and contrast statistics;
- blur estimate;
- scene-change marker.

Candidate activity uses robust motion quantiles so a single flash or hard source
cut does not dominate the score. Exposure and image detail contribute smaller
quality signals, and internal source cuts receive a penalty. Metrics are
normalized independently per source so quieter footage is not excluded solely
because another source contains more camera shake.

Analysis results are cached in `.montage-cache/`. Use `--force-analysis` after
changing a source in place or when testing new analyzer settings.

## Rendering behavior

The renderer makes exact-frame H.264 fragments with hard cuts, concatenates them
without another encode, and removes its temporary working directory after a
successful build. `--keep-work` preserves those fragments for diagnosis. Audio is
intentionally omitted; add a licensed music or sound-design track as a separate
mastering step.

## Prepare desktop and mobile hero assets

After building `public/hero-montage.mp4`, create the optimized site delivery set:

```bash
npm run process:hero
```

This writes desktop 1280×720 and mobile 404×720 MP4/VP9 WebM variants plus JPEG
posters to `public/assets/hero/`. The mobile variant uses a center crop by default.
Shift its horizontal focus when the action sits away from center:

```bash
npm run process:hero -- --mobile-focus 0.35 --overwrite
```

`--mobile-focus 0` anchors the crop left and `1` anchors it right. The default
poster comes from 4.5 seconds, where the central performer survives both crops.
