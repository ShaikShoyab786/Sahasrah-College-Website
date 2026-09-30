---
name: Artifact service root probe
description: Replit artifact autoscale readiness can probe a service's mounted path rather than its explicit health route.
---

When an API artifact is mounted at a path such as `/api`, ensure that mounted root responds with HTTP 200 after the server is ready, even if `artifact.toml` also specifies a deeper health route such as `/api/healthz`.

**Why:** A Replit autoscale publish failed port readiness while the configured health route returned 200, because the artifact runner repeatedly checked the mount root and treated its non-200 response as a closed port.

**How to apply:** Compare deployment log probe paths with the artifact's `services[].paths` and actual routes. Test both the mount root and the configured health path through the shared proxy. If startup is gated on database initialization, register the server only after initialization so the root health response still implies the API is ready.