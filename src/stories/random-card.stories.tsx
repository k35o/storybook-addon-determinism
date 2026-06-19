import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { RandomCard } from './random-card';

const meta = {
  component: RandomCard,
} satisfies Meta<typeof RandomCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;

// Seed 1 pins every source to known values — the determinism guarantee.
export const Seeded: Story = {
  parameters: { determinism: { seed: 1 } },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('uuid')).toHaveTextContent(
      'a3ec09fc-4fa5-4681-8da6-8727b833f7d3',
    );
    await expect(canvas.getByTestId('rand')).toHaveTextContent('0.189677');
    await expect(canvas.getByTestId('bytes')).toHaveTextContent(
      '05b01d1cb8d199d0',
    );
  },
};

// A different seed yields different — but still deterministic — output.
export const DifferentSeed: Story = {
  parameters: { determinism: { seed: 2 } },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('rand')).toHaveTextContent('0.521397');
    await expect(canvas.getByTestId('uuid')).toHaveTextContent(UUID_V4);
  },
};

// Disabled: real crypto / Math.random — still a valid UUID, just not pinned.
export const Disabled: Story = {
  parameters: { determinism: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('uuid')).toHaveTextContent(UUID_V4);
  },
};

// `crypto: false` seeds Math.random only; crypto stays real (not pinned).
export const OnlyRandom: Story = {
  parameters: { determinism: { seed: 1, crypto: false } },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('rand')).toHaveTextContent('0.189677');
    await expect(canvas.getByTestId('uuid')).toHaveTextContent(UUID_V4);
    await expect(canvas.getByTestId('uuid')).not.toHaveTextContent(
      'a3ec09fc-4fa5-4681-8da6-8727b833f7d3',
    );
  },
};

// `random: false` seeds crypto only; Math.random stays real (not pinned).
export const OnlyCrypto: Story = {
  parameters: { determinism: { seed: 1, random: false } },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('uuid')).toHaveTextContent(
      'a3ec09fc-4fa5-4681-8da6-8727b833f7d3',
    );
    await expect(canvas.getByTestId('bytes')).toHaveTextContent(
      '05b01d1cb8d199d0',
    );
    await expect(canvas.getByTestId('rand')).not.toHaveTextContent('0.189677');
  },
};
