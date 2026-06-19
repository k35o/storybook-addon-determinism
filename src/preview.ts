import type { ProjectAnnotations, Renderer } from 'storybook/internal/types';

import { GLOBAL_KEY } from './constants';
import { withDeterminism } from './with-determinism';

const preview: ProjectAnnotations<Renderer> = {
  initialGlobals: {
    [GLOBAL_KEY]: undefined,
  },
  decorators: [withDeterminism],
};

export default preview;

export { normalizeDeterminism } from './with-determinism';
export type { DeterminismConfig, DeterminismParam } from './types';
