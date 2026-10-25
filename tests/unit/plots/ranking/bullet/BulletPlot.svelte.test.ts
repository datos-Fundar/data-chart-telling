import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import { waitForSvg } from '../../_helpers/svg';

const rows = [
	{ c: 'a', v: 60, goal: 70 },
	{ c: 'b', v: 80, goal: 75 },
	{ c: 'c', v: 30, goal: 50 }
];

describe('BulletPlot', () => {
	test('draws a bar and a target tick per category over the range bands', async () => {
		const { container } = render(BulletPlot, {
			props: {
				width: 400,
				height: 300,
				data: rows,
				x: 'v',
				y: 'c',
				target: 'goal',
				ranges: [40, 70, 100]
			}
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.bar-x rect, g.bar-x path').length).toBe(3);
		expect(svg.querySelectorAll('g.tick-x line, g.tick-x path').length).toBe(3);
		// Three bands per category.
		expect(svg.querySelectorAll('g.rule-y line').length).toBe(9);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('upright when the categories run along x', async () => {
		const { container } = render(BulletPlot, {
			props: {
				width: 400,
				height: 300,
				data: rows,
				x: 'c',
				y: 'v',
				target: 'goal',
				ranges: [40, 70, 100]
			}
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.rule-x line').length).toBe(9);
		expect(svg.querySelectorAll('g.tick-y line, g.tick-y path').length).toBe(3);
		expect(svg.outerHTML).not.toContain('NaN');
	});
});
