# Demo scenario

The demo is synthetic and visibly labeled. A compressed TSLAx split drives the same five states and policy semantics used by production:

```text
NORMAL/ALLOW → WATCH/WATCH → PAUSE/PAUSE → UPDATED/WATCH → NORMAL/ALLOW
```

Attempt the guarded action at any stage. During PAUSE the interface shows the exact intended custom-error path: `RWAInteractionPaused(TSLAx, CORPORATE_ACTION_WINDOW)`. Outside PAUSE it succeeds. Until verified deployment metadata exists, the UI describes this as a local enforcement mirror and does not invent a transaction hash.

