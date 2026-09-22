---
name: About visual refinement boundary
description: Presentation refinements on the About page should preserve content, APIs, admin structure, routes, and image management.
---

Visual-only About page work should stay in the presentation layer: interaction polish, responsive behavior, accessibility, and motion may change, but content structure and editing functionality should remain stable.

**Why:** The About page is managed through backend-backed admin sections, so visual iteration should not create content drift or regress the editor workflows.

**How to apply:** For future About styling requests, inspect the existing page and CSS first, then avoid schema, route, API, admin, or upload changes unless the user explicitly asks for them.