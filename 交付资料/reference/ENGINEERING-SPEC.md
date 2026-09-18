# WetBlessing engineering specification

## Scope

The new implementation will retain the visual-novel interaction pattern: scene display, dialogue progression, choices, state persistence, optional unlocks, pause, and responsive portrait/landscape presentation. Previous plot, dialogue, route names, flags, and payment copy are discarded as active design inputs.

## Layering

```text
asset manifest
  -> content schema and compiler
  -> validated state machine
  -> player/presentation
  -> persistence and entitlement adapters
```

### Asset layer

- Every image receives a stable asset key independent of its filename.
- The manifest records path, digest, dimensions, orientation, duplicate group, portrait pairing, visual tags, and review status.
- `orientation` is derived from dimensions; `duplicateGroup` is `null` for unique bytes and a stable group ID for byte-identical files; `portraitPair` is an explicit asset key or `null`.
- `visualTags` starts as `{ status: "pending", values: [] }`. It may be populated only after a human visual review; filenames and historical story labels are not visual tags.
- A missing or unreadable asset fails validation; no runtime fallback is allowed.
- Portrait and landscape files are explicit pair candidates. A pair is never inferred from a node name.

### Content layer

- Content is authored as chapters, scenes, beats, choices, effects, conditions, and endings.
- A beat references an asset key and contains no path construction logic.
- Scene IDs describe authored story units; asset keys describe physical files. They are different namespaces.
- Historical JSON remains outside the active content tree until it is deliberately migrated.

### State layer

- State is typed and namespaced: `progress`, `relationship`, `clue`, `choice`, `entitlement`, and `session`.
- A flag has one declared type and scope. A later write cannot silently change its type.
- Effects are explicit events. Conditions are declarative predicates with an explicit default branch.
- Ordered object insertion must never determine route priority.

### Compiler and validation

The compiler must reject:

- unknown scene, beat, choice, or ending targets;
- missing asset keys or invalid portrait pairs;
- duplicate IDs and duplicate flag declarations;
- conditions that cannot be satisfied;
- nodes without an intentional terminal or outgoing transition;
- endings that are unreachable;
- entitlement gates that are declared in content but not handled by the runtime.

### Presentation

- A visual beat is static by default, with at most a one-shot entrance transition.
- No looping Ken Burns, breathe, or automatic crop cycling while reading or waiting.
- Mobile portrait and desktop landscape compositions are explicit assets.
- The dialogue and choice UI must not become part of the asset semantic model.

### Testing and review

- Unit tests cover state transitions and compiler invariants.
- Asset validation runs before content tests.
- A route review includes a reachable-path table and an asset usage table.
- No test may treat legacy dialogue or node IDs as the new story contract.

## Naming

- TypeScript: `camelCase` functions/variables, `PascalCase` components/types.
- Stable IDs: lowercase dot-separated namespaces, for example `scene.arrival.01` and `asset.scene.pool.lina.01`.
- Flags: `scope.key`, for example `relationship.mia.trust`; no unscoped booleans.
- Paths are stored only in the asset manifest, never assembled from IDs.

## Change policy

Story changes require a content review. Engine changes require tests for state, reachability, and asset validation. Asset replacement requires a digest change review. Legacy material is never edited in place.

## Authored draft and visual observations

`content/story.json` is the only editable story source. `public/assets/story.json` is its validated generated publication. The generator must not infer speakers or dialogue from asset filenames or indices.

Assistant preview observations live in `content/assets.visual-review.json`, bound to each original asset digest. They do not approve human visual tags or pair candidates in the manifest. All human review statuses remain pending in this phase. A pair with conflicting actions cannot be selected for the draft; use explicit full-landscape containment and preserve the unused candidate for review.

Story validation checks source/publication parity, reviewed asset coverage and hashes, speaker consistency, scene speaker evidence, repeated long dialogue and monologues, pair usability, and node reachability. It runs as part of audit, check, and prebuild. See `docs/STORY-REVIEW.md` for evidence, limitations, and the scene index.
