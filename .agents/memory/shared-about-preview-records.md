---
name: Shared About preview records
description: Home Faculty and Gallery reuse About records, while their section heading copy is independent.
---

Home Faculty and Gallery are projections of the About leadership and campus collections. Their Home editors may change Home-specific visibility, featured state, ordering, and preview metadata, but omitting an item from a Home submission must not delete the shared About record.

**Why:** About is an already-completed surface and its content must remain recoverable and editable even when a Home preview changes.

**How to apply:** Prefer Home-only active/featured flags for removals. Only create shared records when the editor explicitly adds a new person or campus item, and preserve the existing About-only fields during updates.

Keep Home preview eyebrow and heading copy in Home-specific storage, separate from both the shared About parent records and the preview card arrays. Give those fields an independent save path so a heading edit cannot replace cards or alter About copy.

**Why:** Home copy is independently editable, and saving it must not change already-working About content or the Home card-management behavior.

**How to apply:** Use a dedicated Home copy model/API for these fields. Do not route heading-only saves through the card-array endpoints or shared About editors.