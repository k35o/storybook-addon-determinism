import React, { useState } from 'react';
import type { FC } from 'react';

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

/**
 * A minimal card that derives its content from `crypto.randomUUID()`,
 * `crypto.getRandomValues()`, and `Math.random()` — the kind of entropy that
 * makes snapshots / VRT flake unless it is seeded. The values are read once via
 * a lazy initializer so they stay stable across re-renders.
 */
export const RandomCard: FC = () => {
  const [data] = useState(() => ({
    id: crypto.randomUUID(),
    value: Math.random(),
    bytes: toHex(crypto.getRandomValues(new Uint8Array(8))),
  }));

  return (
    <output style={{ display: 'block', fontFamily: 'monospace' }}>
      <span data-testid="uuid">{data.id}</span>
      <br />
      <span data-testid="rand">{data.value.toFixed(6)}</span>
      <br />
      <span data-testid="bytes">{data.bytes}</span>
    </output>
  );
};
