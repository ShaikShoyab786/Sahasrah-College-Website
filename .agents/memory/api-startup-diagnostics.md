---
name: API startup diagnostics
description: Production startup failure reporting for the API artifact
---

When database initialization fails before the API begins listening, log the phase and a safe database error code or next action instead of serializing the raw exception.

**Why:** A failed autoscale publish yielded only proxy healthcheck 500s and a port timeout in accessible deployment logs. Raw Prisma or SQL errors can include connection details or content; actionable but sanitized diagnostics avoid exposing those values.

**How to apply:** Keep startup gated on successful database initialization. For new initialization phases, make the failing phase identifiable and provide a safe action in the application log without printing connection strings, query parameters, or user content.