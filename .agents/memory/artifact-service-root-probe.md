---
name: Artifact service root probe
description: Replit artifact autoscale readiness can probe a service's mounted path rather than its explicit health route.
---

When an API artifact is mounted at a path such as `/api`, ensure that mounted root responds with HTTP 200 after the server is ready, even if `artifact.toml` also specifies a deeper health route such as `/api/healthz`.

**Why:** Replit autoscale logs showed probes of the mount root even with a deeper health path configured. Both paths worked locally after adding the root route, but the next publish still timed out. A platform `/api` 500 before the configured port opens does not prove the route itself returned 500; the application may not have started.

**How to apply:** Compare deployment log probe paths with the artifact's `services[].paths` and actual routes. Test both paths through the shared proxy, but do not treat local success as proof that production startup works. Check fresh-install client generation, imports, and database initialization when the port never opens. Preserve readiness gating rather than returning a false healthy response before required initialization.