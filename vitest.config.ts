import { defineConfig } from 'vitest/config';

// jsdom gives the localStorage-backed modules (calibration, highScores) a DOM.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
