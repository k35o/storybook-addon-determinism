---
'storybook-addon-determinism': minor
---

Add CSF factories (CSF Next) support: the package root now exports a `definePreviewAddon` factory, so the addon can be registered with `definePreview({ addons: [determinism()] })` and the `determinism` parameter and global are type-checked in `preview.meta()` / `meta.story()`.
