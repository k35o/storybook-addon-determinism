# Storybook Addon Determinism

A [Storybook](https://storybook.js.org/) addon that **seeds the non-time entropy sources** a component reads at render — `Math.random()`, `crypto.randomUUID()`, and `crypto.getRandomValues()` — so stories render the same pixels every time. Built for deterministic snapshots and visual regression tests of UI whose output would otherwise be random: shuffled layouts, placeholder/skeleton widths, avatar colors, demo chart data, generated ids/keys.

> Need to freeze the **clock** (`Date`, `setTimeout`, `setInterval`, `requestAnimationFrame`, `performance`)? That is a separate concern — use [`storybook-addon-mock-date`](https://github.com/k35o/storybook-addon-mock-date). The two compose cleanly.

## Requirements

- Storybook `^10.0.0`
- Renderer-agnostic — ships a preview decorator that works with any Storybook framework (React, Vue, Svelte, etc.)

## Installation

```sh
npm install --save-dev storybook-addon-determinism
```

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/your-framework';

const config: StorybookConfig = {
  addons: [
    'storybook-addon-determinism', // 👈 register the addon
  ],
};

export default config;
```

## Usage

Enable determinism via the `determinism` parameter at the story, meta, or preview level (precedence: **story > meta > preview**).

```ts
// Button.stories.ts
export const Default: Story = {
  parameters: {
    determinism: true, // seed every source with the default seed (1)
  },
};

// Pick a seed
export const Variant: Story = {
  parameters: {
    determinism: { seed: 42 },
  },
};

// Selectively enable sources
export const OnlyRandom: Story = {
  parameters: {
    determinism: { seed: 42, random: true, crypto: false },
  },
};

// Opt a story out
export const Live: Story = {
  parameters: {
    determinism: false,
  },
};
```

Set a default for every story in `.storybook/preview.ts`:

```ts
const preview: Preview = {
  parameters: {
    determinism: true,
  },
};
```

The seeded sources are **re-applied on every render**, so each story starts from the same sequence regardless of what earlier stories consumed. `Math.random`, `crypto.randomUUID`, and `crypto.getRandomValues` each draw from an independent stream, so one source minting values never shifts another's output.

### Global seed override

The decorator also reads a `determinism` **global**. When it is set to a seed number it forces every source on with that seed, overriding the `determinism` parameter — so the full precedence is **global > story > meta > preview**. This is an escape hatch for driving the seed without touching parameters (from Storybook globals, or a future toolbar):

```ts
// per story
export const Replayed: Story = {
  globals: { determinism: 7 },
};

// or for the whole preview
const preview: Preview = {
  initialGlobals: { determinism: 7 },
};
```

Set it back to `undefined` to fall back to the `determinism` parameter.

## What gets seeded

| Source                     | Replaced with                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Math.random()`            | a seeded PRNG (mulberry32)                                                                                                            |
| `crypto.randomUUID()`      | a deterministic RFC 4122 v4 UUID from the seed (covers nothing else; uuid v4 libraries that call `getRandomValues` are covered below) |
| `crypto.getRandomValues()` | seeded bytes (covers `uuid` v4, `nanoid`, etc.)                                                                                       |

The originals are restored as soon as a story opts out (`determinism: false`), and every render swaps in a fresh patch — so seeded values never leak between stories.

## What does **not** get seeded

This addon only touches the JS entropy APIs above. Out of scope:

- **The clock** — `Date` / timers / `requestAnimationFrame` / `performance`. Use [`storybook-addon-mock-date`](https://github.com/k35o/storybook-addon-mock-date) (they compose).
- **CSS** animations/transitions, the Web Animations API — disable those separately for stable snapshots.
- **`Intl` locale / timezone** — number/date/currency formatting. There is no reliable runtime setter (timezone in particular is only dependable via the `TZ` env var before process start), so it is intentionally left out.
- **Network** — mock with MSW or similar.

## License

MIT
