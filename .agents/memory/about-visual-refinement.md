---
name: About visual refinement boundary
description: Presentation refinements on the About page should preserve content, APIs, admin structure, routes, and image management.
---

Visual-only About page work should stay in the presentation layer: interaction polish, responsive behavior, accessibility, and motion may change, but content structure and editing functionality should remain stable.

**Why:** The About page is managed through backend-backed admin sections, so visual iteration should not create content drift or regress the editor workflows.

**How to apply:** For future About styling requests, inspect the existing page and CSS first, then avoid schema, route, API, admin, or upload changes unless the user explicitly asks for them.

Timeline rails should be laid out structurally with a fixed node column and a separate content column; connector segments should span from one node center to the next instead of relying on page-level pixel offsets.

**Why:** Timeline text can change length through the admin editor, so a hardcoded rail offset or full-height line can drift into the labels and descriptions.

**How to apply:** Tie the rail center to the node size, keep text in a flexible grid column, and animate the same clipped connector path used by the static rail.