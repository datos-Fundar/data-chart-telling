import { defineConfig, type TestProjectConfiguration } from 'vitest/config';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname =
	typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const alias = {
	$lib: path.resolve(dirname, './src/lib'),
	$datasets: path.resolve(dirname, './examples/datasets'),
	'@fundar/data-chart-telling': path.resolve(dirname, './src/lib/index.ts')
};

// Vitest's v8 coverage rejects any configured browser project that the --project filter excludes,
// and the storybook project is excluded from the regular and coverage runs.
const coverageRun = process.argv.includes('--coverage');

const storybookProject: TestProjectConfiguration = {
	extends: true,
	// The Svelte plugin comes with the Storybook config (`viteFinal`): a second one compiles Svelte's output again.
	plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
	test: {
		name: 'storybook',
		browser: {
			enabled: true,
			headless: true,
			provider: playwright({}),
			instances: [{ browser: 'chromium' }]
		}
	}
};

/**
 * The stories again, each compared with a screenshot of it taken on this machine: `pnpm test:visual`. The screenshots
 * live in `.visual/`, which is neither committed nor published, and no other run includes this project.
 */
const visualProject: TestProjectConfiguration = {
	extends: true,
	// A story tagged `no-visual` (one drawn from the network) has no screenshot to hold still.
	plugins: [
		storybookTest({
			configDir: path.join(dirname, '.storybook'),
			tags: { exclude: ['no-visual'] }
		})
	],
	test: {
		name: 'visual',
		// One browser at a time: many open at once lose their connection, as in the browser project.
		maxWorkers: 1,
		// What a failed story leaves behind stays beside its screenshots, out of the repo.
		attachmentsDir: '.visual/attachments',
		setupFiles: [path.join(dirname, '.storybook/vitest.visual.ts')],
		browser: {
			enabled: true,
			headless: true,
			provider: playwright({}),
			instances: [{ browser: 'chromium', viewport: { width: 1280, height: 900 } }],
			expect: {
				toMatchScreenshot: {
					resolveScreenshotPath: ({ arg, ext, testFileDirectory, testFileName }) =>
						path.join(
							dirname,
							'.visual/reference',
							testFileDirectory,
							testFileName,
							`${arg}${ext}`
						),
					resolveDiffPath: ({ arg, ext, testFileDirectory, testFileName }) =>
						path.join(dirname, '.visual/diff', testFileDirectory, testFileName, `${arg}${ext}`)
				}
			}
		}
	}
};

export default defineConfig({
	resolve: { alias },
	test: {
		coverage: {
			provider: 'v8',
			include: ['src/lib/**'],
			reporter: ['text-summary', 'lcov', 'json-summary', 'json']
		},
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
						headless: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.test.ts', 'tests/**/*.svelte.test.ts'],
					// Many parallel browser iframes intermittently lose their orchestrator connection.
					maxWorkers: 1
				}
			},

			// ── Local timing checks ──────────────────────────────────────────────────
			// Run with: pnpm test:perf (kept out of `pnpm test` and CI: a time limit is flaky on a loaded machine)
			...(coverageRun
				? []
				: [
						{
							plugins: [svelte({ preprocess: vitePreprocess() })],
							resolve: { alias },
							test: {
								name: 'perf',
								browser: {
									enabled: true,
									headless: true,
									provider: playwright(),
									instances: [{ browser: 'chromium' }]
								},
								include: ['tests/perf/**/*.perf.svelte.ts'],
								maxWorkers: 1
							}
						} satisfies TestProjectConfiguration
					]),

			// ── Storybook stories as Vitest tests ────────────────────────────────────
			// Run separately with: pnpm vitest --project=storybook
			// (requires the Storybook dev server to boot internally via storybookTest)
			...(coverageRun ? [] : [storybookProject, visualProject])
		]
	}
});
