---
'storybook-addon-determinism': patch
---

Drop the runtime `storybook/internal/csf` import from the factory entry. `definePreviewAddon` is an identity function at runtime, and importing it as a value made consumer Vite dependency optimization prebundle a copy of Storybook internals into the addon chunk, which caused stories to time out randomly under Storybook's vitest browser mode. The factory now borrows the `PreviewAddon` type only and returns the `/preview` annotations as-is; no API change.
