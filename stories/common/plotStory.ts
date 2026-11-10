import type { StoryObj } from '@storybook/svelte-vite';
import type { Component } from 'svelte';
import { renderSource } from './docsSource';

/**
 * A story that draws `Plot` with `props`, its Docs panel showing the call as an author writes it, so stories that
 * draw several plot kinds name each one. `props` are checked against the plot's own.
 */
export function plotStory<TProps extends Record<string, unknown>>(
	Plot: Component<TProps>,
	name: string,
	props: NoInfer<TProps>
): StoryObj {
	return {
		render: () => ({ Component: Plot as never, props }),
		parameters: { docs: { source: { code: renderSource(name, props), language: 'html' } } }
	};
}
