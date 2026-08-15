# storybook-addon-determinism

## 0.2.1

### Patch Changes

- Drop the runtime `storybook/internal/csf` import from the factory entry. `definePreviewAddon` is an identity function at runtime, and importing it as a value made consumer Vite dependency optimization prebundle a copy of Storybook internals into the addon chunk, which caused stories to time out randomly under Storybook's vitest browser mode. The factory now borrows the `PreviewAddon` type only and returns the `/preview` annotations as-is; no API change.

## 0.2.0

### Minor Changes

- Add CSF factories (CSF Next) support: the package root now exports a `definePreviewAddon` factory, so the addon can be registered with `definePreview({ addons: [determinism()] })` and the `determinism` parameter and global are type-checked in `preview.meta()` / `meta.story()`.

## 0.1.2

### Patch Changes

- Switch release automation from changesets/action to pnpm-release-action (pnpm built-in release management). No runtime changes.

## 0.1.1

### Patch Changes

- [#4](https://github.com/k35o/storybook-addon-determinism/pull/4) [`6f8b267`](https://github.com/k35o/storybook-addon-determinism/commit/6f8b26737b9405eb33d7e5e66bcfd57a69aff16e) Thanks [@k35o](https://github.com/k35o)! - Document the `determinism` global seed override in the README. Setting the `determinism` global to a seed number forces every source on with that seed, overriding the parameter — the full precedence is global > story > meta > preview.
