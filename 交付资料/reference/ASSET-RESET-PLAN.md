# Asset reset plan

## Source of truth

The current physical source of truth is the filesystem under `public/assets/` and `public/media/`. Historical paths in `docs/` such as `/cursor/stores/...` are annotations only.

Current inventory:

| Group | Count | Role |
|---|---:|---|
| Landscape scene WebP | 83 | Ch01, heat, Ch02–Ch04, and six isolated W2–W4 climax images |
| Portrait files | 63 | 720×1280 orientation variants and composition references |
| Character sheets | 4 | Kai, Mia, Jade, Vanessa |
| Audio/video | 0 | No current sound or video material |
| Font | 1 | Noto Serif SC hint font |

## Retention tiers

| Tier | Material | Active status |
|---|---|---|
| A | Ch02–Ch04 sets; `heat/S04`, `S06a`, `S06b`, `S06c`, `S11`, `S14`; character-specific Ch01 stills | Primary candidate pool |
| B | Ch01 public/transition stills, legacy heat stills, character sheets, portrait variants | Retain as reusable library; semantics pending review |
| C | Shared or semantically conflicting legacy heat files and duplicate aliases | Retain physically; archive from runtime use |
| D | Six W2–W4 climax WebPs without complete surrounding scenes | Isolated reference material |
| E | 48 missing W2–W4 draft references | Forbidden dependency |

## Known duplicate groups

The following files are byte-identical and need one canonical asset record later:

- `scenes/ch01/n_free_soft_exit.webp`
- `scenes/ch01/n_title.webp`
- `scenes/ch01/n_pay_settle.webp`
- `scenes/ch01/n_pay_02_ot_a.webp`

Portrait duplicates:

- `ch01-portrait/C1-D2-portrait.png`
- `ch01-portrait/C1-12-portrait.png`
- `ch02-portrait/C2-13E-portrait.png`

No physical deletion is performed during the reset. Deduplication happens only after the new manifest and all references are validated.

## Required manifest fields

```text
id (assetKey)
path
sha256
width / height
orientation
kind
duplicateGroup
portraitPair
visualTags
reviewStatus
```

`visualTags` describe what is visibly present: location, people, time, action, framing, mood, and continuity constraints. They do not import old plot meanings.

## Preview review checkpoint

All 150 images now have assistant preview observations in `content/assets.visual-review.json`. This companion review does not replace the manifest or count as human approval; existing `visualTags` and review statuses remain pending. Of 64 pair candidates, 61 look consistent at preview scale, two change character placement, and one changes the depicted action. The latter (`asset.image.064` / `asset.image.100`) remains indexed but is not selected in the revised story. No original hashes or image bytes change. Details: `docs/STORY-REVIEW.md`.
