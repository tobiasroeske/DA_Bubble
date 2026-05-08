import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    environment: 'jsdom',
    include: ['src/app/shared/repositories/**/*.spec.ts'],
    reporters: ['default'],
    server: {
      deps: {
        inline: ['rxfire', '@angular/fire'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/app/shared/repositories/**/*.ts'],
    },
  },
});
