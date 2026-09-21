---
name: Artifact build environment
description: Environment values needed when running workspace artifact builds outside managed workflows
---

Standalone Vite artifact builds require `PORT` and `BASE_PATH` to be present in the environment. The managed Replit workflows already provide these values.

**Why:** Running the workspace build wrapper without those values fails while loading artifact Vite configs, even when the application typechecks and the managed preview is healthy.

**How to apply:** When validating a web artifact from the shell, provide an explicit port and artifact base path, then run the artifact-specific build.