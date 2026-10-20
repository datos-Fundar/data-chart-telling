import type { StorybookConfig } from '@storybook/svelte-vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
	stories: [
		// '../stories/**/*.mdx',   // uncomment when MDX docs are added
		'../stories/**/*.stories.@(js|ts|svelte)'
	],
	addons: [
		'@storybook/addon-svelte-csf',
		'@chromatic-com/storybook',
		'@storybook/addon-vitest',
		'@storybook/addon-a11y',
		'@storybook/addon-docs'
	],
	framework: {
		name: '@storybook/svelte-vite',
		options: {
			// svelte-docgen-plugin is not yet compatible with Vite 8 / rolldown.
			// Controls still work via the explicit argTypes defined in each story.
			docgen: false
		}
	},

	async viteFinal(config) {
		const { mergeConfig } = await import('vite');
		return mergeConfig(config, {
			plugins: [
				// Explicitly include the Svelte plugin so Vite 8 / rolldown can process
				// .svelte files (Storybook's own framework plugin may not fire correctly
				// under rolldown yet).
				svelte({ preprocess: vitePreprocess() })
			],
			resolve: {
				alias: {
					$lib: path.resolve(__dirname, '../src/lib'),
					$examples: path.resolve(__dirname, '../examples')
				}
			}
		});
	}
};

export default config;
