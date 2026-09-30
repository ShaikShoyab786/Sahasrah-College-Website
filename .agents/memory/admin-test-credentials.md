---
name: Admin test credentials
description: A limitation of isolated browser testing for this project's protected admin flows.
---

An isolated browser-testing session may not receive the workspace's initial-admin environment variables even when ordinary workspace shell commands can reference them. Do not copy credential values into a test prompt or log.

**Why:** The browser tester reached the admin login screen but could not access the configured variables. A non-printing shell script that used the existing environment verified the authenticated API flow and cleaned up its temporary record.

**How to apply:** Check whether an admin browser test can authenticate safely before planning a protected UI journey. If not, verify the protected endpoints using environment-variable references in a non-printing workspace script, clean up test data in a `finally` block, and check the public UI separately. State clearly that the admin UI itself was not exercised end-to-end.