import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { waitForSvg } from '../../_helpers/svg';

const DATA = [
	{ cat: 'A', series: 'first', value: 10 },
	{ cat: 'A', series: 'second', value: 20 }
];

// A bar plot stacks along its value axis: `stackY` for vertical bars, `stackX` for horizontal ones.
describe.each([
	['vertical', { x: 'cat', y: 'value' }, 'stackY'],
	['horizontal', { x: 'value', y: 'cat' }, 'stackX']
] as const)('BarPlot - stacking %s bars with %s', (orientation, channels, stack) => {
	test('the series pile up into one bar along the value axis', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			data: DATA,
			...channels,
			color: 'series',
			transforms: [{ type: stack }]
		});
		const svg = await waitForSvg(container);
		const horizontal = orientation === 'horizontal';
		await expect.poll(() => bars(svg).length).toBe(2);
		const [first, second] = bars(svg).sort((a, b) =>
			horizontal ? a.left - b.left : b.top - a.top
		);
		const length = (box: DOMRect) => (horizontal ? box.width : box.height);
		// One starts where the other ends, and the second is twice as long.
		const joint = horizontal ? [first.right, second.left] : [first.top, second.bottom];
		expect(joint[0]).toBeCloseTo(joint[1], 0);
		expect(length(second) / length(first)).toBeCloseTo(2, 1);
	});
});

function bars(svg: SVGElement): DOMRect[] {
	return Array.from(svg.querySelectorAll('g.bar-x rect, g.bar-y rect'))
		.filter((r) => !r.classList.contains('dct-hit-area'))
		.map((r) => r.getBoundingClientRect());
}
