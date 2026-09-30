---
name: GCS stream listener warning
description: Interpreting MaxListenersExceededWarning from Google Cloud Storage object reads.
---

Google Cloud Storage reads can emit `MaxListenersExceededWarning` from the storage client's internal one-request `PassThrough` pipeline, even when the file read completes successfully. This warning is separate from the application's outer Node/Web stream adapters.

**Why:** A traced read showed the listeners being added by the storage client's HTTP pipeline, and the warning persisted when changing the app's response adapter.

**How to apply:** Confirm image requests complete and listeners do not accumulate across requests. Do not raise Node's global listener limit or keep rewriting the response adapter just to hide this upstream warning; revisit if the dependency version changes or reads stop completing.