---
name: Admin theme boundary
description: Admin-only semantic contrast and branding rules for the college dashboard.
---

Admin dashboard styling should use a dedicated semantic token layer derived from the saved palette, while public Home and About roots continue using the public theme helper unchanged. Admin chrome should prefer the configured college logo and use a branded fallback asset only when no logo is saved.

**Why:** Public and admin surfaces have different contrast needs. Accent foregrounds that are valid on dark public sections can become unreadable when reused as labels on pale admin cards.

**How to apply:** Put admin text, surface, border, input, focus, and on-color decisions in the admin theme helper; keep shared admin form primitives on those variables and pass branding into the admin shell without changing public header/footer behavior.