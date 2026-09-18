# Interaction contract

This contract preserves the useful player behavior without preserving the old story.

| Interaction | Required behavior |
|---|---|
| Dialogue tap/click | Reveal the current line, then advance one beat when fully revealed |
| Choice | Show only choices whose conditions are true; selecting one applies declared effects exactly once |
| Scene change | Resolve an explicit asset key and show the complete selected composition |
| Pause | Freeze reading, scene, and automatic progression |
| Save/resume | Persist schema version, story version, asset manifest version, node position, and typed state |
| Unlock | Ask an entitlement adapter; content owns the gate and the adapter owns payment mechanics |
| Orientation | Select an explicitly paired portrait or landscape asset; never fabricate a crop as a substitute |
| Missing material | Stop with a clear validation error before play begins |

The old implementation in `archive/legacy/components/` is a behavior reference only. New components must not import legacy content, node IDs, or flag names.
