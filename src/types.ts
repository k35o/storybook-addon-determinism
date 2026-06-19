export type DeterminismConfig = {
  /** PRNG seed. The same seed always produces the same sequence. Defaults to `1`. */
  seed?: number;
  /** Seed `Math.random`. Defaults to `true`. */
  random?: boolean;
  /**
   * Make `crypto.randomUUID` / `crypto.getRandomValues` deterministic
   * (covers uuid v4, nanoid, etc.). Defaults to `true`.
   */
  crypto?: boolean;
};

/**
 * The `determinism` parameter accepts a boolean (`true` enables every source
 * with the default seed) or a configuration object.
 */
export type DeterminismParam = boolean | DeterminismConfig;
