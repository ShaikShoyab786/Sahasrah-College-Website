---
name: Native carousel compatibility
description: The Sahasara web app should prefer native scroll-snap carousels over Embla hooks when adding touch carousels.
---

Prefer a native horizontal scroll-snap carousel for new Sahasara web sections instead of importing Embla React hooks.

**Why:** The workspace produced a runtime invalid-hook-call error when the Embla React hook was used, despite passing TypeScript and dependency checks. On touch devices, touch release can focus a slide or trigger compatibility hover behavior, leaving a generic pause state active after the gesture.

**How to apply:** Use a scroll container with snap-aligned cards, pause-on-interaction autoplay, and a `prefers-reduced-motion` check. Track hover with pointer events that ignore touch pointers, and do not treat focus created during touch as keyboard focus; let the touch pause clear after the gesture settles.