---
name: Prisma CLI stability
description: Why this project deliberately pins Prisma 6 instead of following the latest package tag.
---

Keep Prisma and `@prisma/client` on the stable 6.x line unless a later migration is explicitly planned and verified. Avoid blind full-schema `prisma db push` runs: this database also contains non-Prisma Knowledge Hub tables, and Prisma proposed dropping six non-empty tables. Use the project's idempotent additive startup guards for safe schema extensions.

**Why:** In this environment the latest package tag resolved to an unreleased Prisma 8 CLI that did not provide the standard `prisma generate` command, blocking client generation. The database also contains tables outside Prisma's model set, so a full sync can threaten unrelated persisted data.

**How to apply:** Preserve matching Prisma CLI/client major versions. Before any `db push`, inspect the proposed changes and investigate unrelated table drops; never bypass those warnings with `--accept-data-loss`. Prefer idempotent additive startup SQL for compatible column additions.