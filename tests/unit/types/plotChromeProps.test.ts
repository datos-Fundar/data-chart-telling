import { describe, test, expect } from 'vitest';
import type { Snippet } from 'svelte';
import type { PlotChromeProps } from '$lib/types/plots/props';

const snippet = (() => {}) as unknown as Snippet;

// Each `@ts-expect-error` is checked by `svelte-check`: the line below it must not type-check.
const valid: PlotChromeProps[] = [
	{},
	{ title: 'T', subtitle: 'S', caption: 'C', order: ['plot', 'title', 'subtitle', 'caption'] },
	{ header: snippet, footer: snippet, order: ['footer', 'plot', 'header'] },
	{ title: 'T', legend: [], order: ['legend', 'plot', 'title'] },
	{ order: ['plot'] },
	// `divider` fits any chrome, as many times as wanted.
	{ caption: 'C', order: ['divider', 'plot', 'divider', 'caption'] },
	// A block that may be unset at runtime still counts as passed.
	{ title: undefined as string | undefined, order: ['title', 'plot'] }
];

const invalid: PlotChromeProps[] = [
	// @ts-expect-error `footer` isn't passed, `caption` is.
	{ caption: 'C', order: ['plot', 'footer'] },
	// @ts-expect-error `subtitle` isn't passed.
	{ title: 'T', order: ['title', 'subtitle', 'plot'] },
	// @ts-expect-error `legend` isn't passed.
	{ order: ['legend', 'plot'] },
	// @ts-expect-error `header` replaces `title`, so they can't both be passed.
	{ header: snippet, title: 'T' },
	// @ts-expect-error `footer` replaces `caption`, so they can't both be passed.
	{ footer: snippet, caption: 'C' }
];

describe('PlotChromeProps', () => {
	test('`order` only takes the blocks that are passed, plus `plot`', () => {
		expect(valid).toHaveLength(7);
		expect(invalid).toHaveLength(5);
	});
});
