---
name: GitHub push authentication
description: The repository's GitHub push may require Basic authorization even when bearer authorization is rejected.
---

For this repository, pushing with a GitHub personal access token in an `AUTHORIZATION: bearer` header was rejected, while Basic authorization using `x-access-token:<token>` succeeded.

**Why:** The GitHub remote accepted the token only through the Basic-auth transport in this environment.

**How to apply:** Keep the token out of command output and use the environment secret only in an ephemeral Git extraheader when a normal push reports invalid credentials.