# storybook-addon-determinism

## 0.1.2

### Patch Changes

- Switch release automation from changesets/action to pnpm-release-action (pnpm built-in release management). No runtime changes.

## 0.1.1

### Patch Changes

- [#4](https://github.com/k35o/storybook-addon-determinism/pull/4) [`6f8b267`](https://github.com/k35o/storybook-addon-determinism/commit/6f8b26737b9405eb33d7e5e66bcfd57a69aff16e) Thanks [@k35o](https://github.com/k35o)! - Document the `determinism` global seed override in the README. Setting the `determinism` global to a seed number forces every source on with that seed, overriding the parameter — the full precedence is global > story > meta > preview.
