import type { StoryObj } from '@storybook/svelte-vite';
import type { Component } from 'svelte';
import { renderSource } from '../../common/docsSource';

/**
 * A story that draws `Plot` with `props`, its Docs panel showing the call as an author writes it. The stories
 * of a hover feature draw different plot kinds, so each one names its own.
 */
export function plotStory(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Plot: Component<any>,
	name: string,
	props: Record<string, unknown>
): StoryObj {
	return {
		render: () => ({ Component: Plot as never, props }),
		parameters: { docs: { source: { code: renderSource(name, props), language: 'html' } } }
	};
}
