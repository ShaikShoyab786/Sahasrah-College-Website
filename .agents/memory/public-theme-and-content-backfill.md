---
name: Public theme and content backfill
description: Runtime public colour settings and safe correction of persisted user-facing college copy.
---

Public theme settings should resolve saved hex colours into the existing HSL design tokens at the public page root; keep admin colours stable and normalize 3- or 6-digit input before saving. Reusable presets should persist both their identifier and all three colors, with custom hex editing as an advanced path. Shared public eyebrows need explicit light-section and dark-background variants rather than inheriting one foreground token. User-facing spelling corrections need an idempotent startup backfill that preserves unrelated content. Backfills that add course-highlight defaults must preserve legacy category, title, and description copy; seeded text is fallback content, not permission to overwrite stored or admin-authored wording.

**Why:** The public components already consume shared CSS tokens, so changing those tokens is safer than replacing every component. Existing database records are not reseeded when defaults change.

**How to apply:** Keep runtime theme conversion in one shared helper, validate at the API contract and admin form, make the official Sahsrah Blue & Red preset the database default, and run targeted text backfills without renaming internal identifiers, routes, asset paths, or cookie names.