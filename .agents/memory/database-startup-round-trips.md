---
name: Database startup round trips
description: Keep autoscale API database initialization bounded when it runs against the production database.
---

Broad startup backfills should avoid one client/server round trip per column or record. Prefer a bounded, database-side operation when it preserves the same updates, and log safe stage names and durations while keeping readiness gated on successful initialization.

**Why:** The production database was reachable and small, but a legacy text correction iterated over hundreds of eligible columns with a separate sequential update for each. The deployment process stayed inside initialization until its 60-second port deadline, with no stage-level logs to identify where it was waiting.

**How to apply:** Review nested loops in startup initializers for repeated database calls, especially schema-wide work. Measure against production-like latency and retain enough non-sensitive progress logs to distinguish connection, schema, backfill, and content-seeding stages.