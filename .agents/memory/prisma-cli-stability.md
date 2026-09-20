---
name: Prisma CLI stability
description: Why this project deliberately pins Prisma 6 instead of following the latest package tag.
---

Keep Prisma and `@prisma/client` on the stable 6.x line unless a later migration is explicitly planned and verified.

**Why:** In this environment the latest package tag resolved to an unreleased Prisma 8 CLI that did not provide the standard `prisma generate` command, blocking client generation.

**How to apply:** Preserve matching Prisma CLI/client major versions. Before upgrading, verify both client generation and database push commands in this pnpm workspace.