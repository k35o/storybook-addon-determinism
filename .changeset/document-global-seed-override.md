---
"storybook-addon-determinism": patch
---

Document the `determinism` global seed override in the README. Setting the `determinism` global to a seed number forces every source on with that seed, overriding the parameter — the full precedence is global > story > meta > preview.
