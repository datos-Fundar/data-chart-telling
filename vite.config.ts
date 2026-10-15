import { defineConfig } from 'vitest/config';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname =
	typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const alias = {
	$lib: path.resolve(dirname, './src/lib'),
	'@fundar/data-chart-telling': path.resolve(dirname, './src/lib/index.ts')
};

export default defineConfig({
	resolve: { alias },
	test: {
		projects: [
			// ── Node unit tests ──────────────────────────────────────────────────────
			{
				resolve: { alias },
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
					exclude: ['src/**/*.svelte.test.ts', 'tests/**/*.svelte.test.ts', 'node_modules/**']
				}
			},

			// ── Real-browser component tests ─────────────────────────────────────────
			{
				plugins: [svelte({ preprocess: vitePreprocess() })],
				resolve: { alias },
				test: {
					name: 'browser',
					browser: {
						enabled: true,
						instances: [{ browser: 'chromium', provider: playwright(), headless: true }]
					},
					include: ['src/**/*.svelte.test.ts', 'tests/**/*.svelte.test.ts'],
					// Many parallel browser iframes intermittently lose their orchestrator connection.
					maxWorkers: 1
				}
			},

			// ── Storybook stories as Vitest tests ────────────────────────────────────
			// Run separately with: pnpm vitest --project=storybook
			// (requires the Storybook dev server to boot internally via storybookTest)
			{
				extends: true,
				plugins: [
					svelte({ preprocess: vitePreprocess() }),
					storybookTest({ configDir: path.join(dirname, '.storybook') })
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [{ browser: 'chromium' }]
					}
				}
			}
		]
	}
});
