import { definePreview } from '@storybook/react-vite';
import determinism from 'storybook-addon-determinism';

export default definePreview({
  addons: [determinism()],
  parameters: {
    determinism: true,
  },
});
