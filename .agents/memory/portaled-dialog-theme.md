---
name: Public theme in portaled dialogs
description: How public theme CSS variables reach modal content rendered outside the page root.
---

When a public dialog renders through a portal into `document.body`, theme CSS variables on the page wrapper do not inherit. Apply the active public theme to the portal content with the shared theme helper.

**Why:** Portal content escapes the page theme subtree, so token-based popup colors otherwise fall back to global defaults despite the surrounding page's saved palette.

**How to apply:** For public modals, check where the portal mounts and apply the public theme at the dialog content boundary. Keep global/admin theme roots and shared dialog defaults unchanged.