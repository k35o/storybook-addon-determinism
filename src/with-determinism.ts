/* eslint-disable unicorn/prefer-math-trunc -- the PRNG relies on `| 0` / `>>> 0` for int32 / uint32 wraparound; Math.trunc only truncates the float and would change the generated sequence */
import type { PartialStoryFn, StoryContext } from 'storybook/internal/types';

import { DEFAULT_SEED, GLOBAL_KEY, PARAM_KEY } from './constants';
import type { DeterminismConfig, DeterminismParam } from './types';

// A small, fast, well-distributed seeded PRNG. Same seed → same sequence.
const createRandom = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d_2b_79_f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const makeGetRandomValues =
  (rng: () => number) =>
  <T extends ArrayBufferView>(array: T): T => {
    const bytes = new Uint8Array(
      array.buffer,
      array.byteOffset,
      array.byteLength,
    );
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = (rng() * 256) | 0;
    }
    return array;
  };

const makeRandomUUID = (rng: () => number): (() => string) => {
  const hex: string[] = [];
  for (let i = 0; i < 256; i += 1) {
    hex.push((i + 0x1_00).toString(16).slice(1));
  }
  return () => {
    const b: number[] = [];
    for (let i = 0; i < 16; i += 1) {
      b.push((rng() * 256) | 0);
    }
    // byte 6 high nibble marks version 4
    b[6] = (b[6] & 0x0f) | 0x40;
    // byte 8 high bits mark the RFC 4122 variant
    b[8] = (b[8] & 0x3f) | 0x80;
    return (
      `${hex[b[0]]}${hex[b[1]]}${hex[b[2]]}${hex[b[3]]}-` +
      `${hex[b[4]]}${hex[b[5]]}-` +
      `${hex[b[6]]}${hex[b[7]]}-` +
      `${hex[b[8]]}${hex[b[9]]}-` +
      `${hex[b[10]]}${hex[b[11]]}${hex[b[12]]}${hex[b[13]]}${hex[b[14]]}${hex[b[15]]}`
    );
  };
};

type Normalized = {
  enabled: boolean;
  seed: number;
  random: boolean;
  crypto: boolean;
};

const isConfig = (value: unknown): value is DeterminismConfig =>
  typeof value === 'object' && value !== null;

export const normalizeDeterminism = (
  param: DeterminismParam | undefined,
  globalSeed: number | undefined,
): Normalized => {
  // Toolbar/global override (a seed number) forces every source on.
  if (typeof globalSeed === 'number') {
    return { enabled: true, seed: globalSeed, random: true, crypto: true };
  }
  if (param === undefined || param === false) {
    return { enabled: false, seed: DEFAULT_SEED, random: false, crypto: false };
  }
  if (param === true) {
    return { enabled: true, seed: DEFAULT_SEED, random: true, crypto: true };
  }
  if (isConfig(param)) {
    return {
      enabled: true,
      seed: param.seed ?? DEFAULT_SEED,
      random: param.random ?? true,
      crypto: param.crypto ?? true,
    };
  }
  return { enabled: false, seed: DEFAULT_SEED, random: false, crypto: false };
};

// Distinct streams so one source's consumption never shifts another's sequence
// (a component minting a UUID must not change what `Math.random` returns).
const RANDOM_STREAM = 0x9e_37_79_b9;
const UUID_STREAM = 0x85_eb_ca_6b;
const BYTES_STREAM = 0xc2_b2_ae_35;

const install = (
  seed: number,
  random: boolean,
  useCrypto: boolean,
): (() => void) => {
  // The originals captured below (the `Math.random` reference and the crypto
  // property descriptors) are guaranteed to be the genuine natives because the
  // decorator always restores the previous patch before calling install.
  const undo: Array<() => void> = [];

  if (random) {
    const previous = Math.random;
    Math.random = createRandom((seed ^ RANDOM_STREAM) >>> 0);
    undo.push(() => {
      Math.random = previous;
    });
  }

  const cryptoObj = globalThis.crypto as Crypto | undefined;
  if (useCrypto && cryptoObj) {
    const previousUUID = Object.getOwnPropertyDescriptor(
      cryptoObj,
      'randomUUID',
    );
    const previousBytes = Object.getOwnPropertyDescriptor(
      cryptoObj,
      'getRandomValues',
    );
    Object.defineProperty(cryptoObj, 'randomUUID', {
      value: makeRandomUUID(createRandom((seed ^ UUID_STREAM) >>> 0)),
      configurable: true,
      writable: true,
    });
    Object.defineProperty(cryptoObj, 'getRandomValues', {
      value: makeGetRandomValues(createRandom((seed ^ BYTES_STREAM) >>> 0)),
      configurable: true,
      writable: true,
    });
    undo.push(() => {
      if (previousUUID) {
        Object.defineProperty(cryptoObj, 'randomUUID', previousUUID);
      } else {
        Reflect.deleteProperty(cryptoObj, 'randomUUID');
      }
      if (previousBytes) {
        Object.defineProperty(cryptoObj, 'getRandomValues', previousBytes);
      } else {
        Reflect.deleteProperty(cryptoObj, 'getRandomValues');
      }
    });
  }

  return () => {
    for (const fn of undo) {
      fn();
    }
  };
};

let restore: (() => void) | undefined;

export const withDeterminism = (
  StoryFn: PartialStoryFn,
  context: StoryContext,
) => {
  const { enabled, seed, random, crypto } = normalizeDeterminism(
    context.parameters[PARAM_KEY] as DeterminismParam | undefined,
    context.globals[GLOBAL_KEY] as number | undefined,
  );

  // Re-seed on every render: restore the previous patch, then (if enabled)
  // install a fresh one so each story starts from the same seeded sequence
  // regardless of what earlier stories consumed.
  if (restore) {
    restore();
    restore = undefined;
  }
  if (enabled) {
    restore = install(seed, random, crypto);
  }

  // eslint-disable-next-line typescript/no-unsafe-return -- Storybook's PartialStoryFn return type is loosely typed
  return StoryFn(context);
};
