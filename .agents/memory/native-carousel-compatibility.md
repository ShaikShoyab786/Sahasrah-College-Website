---
name: Native carousel compatibility
description: The Sahasara web app should prefer native scroll-snap carousels over Embla hooks when adding touch carousels.
---

Prefer a native horizontal scroll-snap carousel for new Sahasara web sections instead of importing Embla React hooks.

**Why:** The workspace produced a runtime invalid-hook-call error when the Embla React hook was used, despite passing TypeScript and dependency checks. Native scrolling provides touch dragging, keyboard buttons, autoplay, and reduced-motion support without introducing another React hook runtime.

**How to apply:** Use a scroll container with snap-aligned cards, explicit previous/next controls, a pause-on-interaction autoplay timer, and a `prefers-reduced-motion` check.