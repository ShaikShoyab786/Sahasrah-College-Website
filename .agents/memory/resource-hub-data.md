---
name: Resource Hub data boundary
description: Rules for separating resource records from legacy homepage previews and maintaining publication eligibility.
---

Keep Resource Hub records independent of the legacy homepage resource-preview data. Do not seed sample or imported materials; until admins add actual resources, an empty public library is expected.

**Why:** Preview entries have a separate purpose and editing path, and sample or imported PDFs could be mistaken for reviewed study material.

Only published resources in visible categories are eligible for public visibility and featured selection. When a featured resource is unpublished, moved into a hidden category, or deleted, clear its featured pointer and keep the admin editor state synchronized.

**Why:** A stale pointer can disappear publicly while remaining selected in the editor, causing later page saves to fail or misrepresent the featured resource.

**How to apply:** Keep future imports, status or category visibility changes, and delete operations aligned with these constraints.