import type { PreviewAddon } from 'storybook/internal/csf';

import preview from './preview';
import type { DeterminismTypes } from './types';

export { normalizeDeterminism } from './with-determinism';
export type {
  DeterminismConfig,
  DeterminismParam,
  DeterminismTypes,
} from './types';

// `definePreviewAddon` is an identity function at runtime, but calling it makes
// this entry depend on `storybook/internal/csf` at runtime. When a consumer
// registers the factory in `preview.ts`, Vite's dependency optimizer prebundles
// a copy of those internals into the addon chunk, which makes stories time out
// randomly under Storybook's vitest browser mode. Borrow the type only and
// return the `/preview` annotations as-is.
const determinism = (): PreviewAddon<DeterminismTypes> => preview;

export default determinism;
