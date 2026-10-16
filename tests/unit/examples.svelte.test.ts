import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import type { Component } from 'svelte';
import { waitForSvg } from './plots/_helpers/svg';

/**
 * `examples/` ships in the package as the reference for authors and LLMs, so
 * each one must keep mounting and drawing a plot.
 */
const EXAMPLES = import.meta.glob<{ default: Component }>('../../examples/*.svelte', {
	eager: true
});

// Helpers an example pulls in, not examples of their own.
const PARTS = new Set(['LegendReader', 'TooltipCard']);

describe('examples', () => {
	const entries = Object.entries(EXAMPLES).filter(
		([file]) => !PARTS.has(file.split('/').pop()!.replace('.svelte', ''))
	);

	test('there are examples to check', () => {
		expect(entries.length).toBeGreaterThan(0);
	});

	for (const [file, mod] of entries) {
		test(`${file.split('/').pop()} draws a plot`, async () => {
			const { container } = render(mod.default);
			const svg = await waitForSvg(container);
			expect(svg.querySelectorAll('path, rect, circle').length).toBeGreaterThan(0);
		});
	}
});
