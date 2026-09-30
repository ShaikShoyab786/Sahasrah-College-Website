---
name: JSON page settings evolution
description: Compatibility rule for adding required fields to persisted page-settings documents.
---

When extending a JSON-backed page settings contract with required fields, merge defaults into stored settings on read and keep stored values authoritative. Do not reset the whole record to the newest defaults.

**Why:** Older saved documents lack the new fields, so strict generated response validation can fail even though the original page settings are valid. Replacing the record would erase previous admin edits.

**How to apply:** Check the read path whenever a page settings schema grows. Return a merged model to public and admin callers, then let the admin save persist any newly editable fields alongside the preserved settings.