import { definePreviewAddon } from 'storybook/internal/csf';

import preview from './preview';
import type { DeterminismTypes } from './types';

export { normalizeDeterminism } from './with-determinism';
export type {
  DeterminismConfig,
  DeterminismParam,
  DeterminismTypes,
} from './types';

const determinism = () => definePreviewAddon<DeterminismTypes>(preview);

export default determinism;
