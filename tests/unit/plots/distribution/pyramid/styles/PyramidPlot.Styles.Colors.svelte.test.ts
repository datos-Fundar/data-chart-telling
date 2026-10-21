import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import { POPULATION_PYRAMID } from '../../../../../../stories/data/population-pyramid';
import { waitForSvg } from '../../../_helpers/svg';

const DATA_2022 = POPULATION_PYRAMID.filter((d) => d.year === 2022);
const DATA_PROPS = {
	data: DATA_2022,
	x: 'pct' as const,
	y: 'ageGroup' as const,
	color: 'sex' as const
};

function barFills(svg: SVGElement): string[] {
	return Array.from(svg.querySelectorAll('g.bar-x rect')).map((r) => getComputedStyle(r).fill);
}

describe('PyramidPlot - color', () => {
	test('left and right series get different colors by default', async () => {
		const { container } = await render(PyramidPlot, { width: 560, height: 520, ...DATA_PROPS });
		const svg = await waitForSvg(container);
		expect(new Set(barFills(svg)).size).toBe(2);
	});

	test('scales.color with a categorical scheme overrides the default palette', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			scales: { color: { scheme: { Female: '#ff0000', Male: '#0000ff' } } }
		});
		const svg = await waitForSvg(container);
		const fills = new Set(barFills(svg));
		expect(fills).toContain('rgb(255, 0, 0)');
		expect(fills).toContain('rgb(0, 0, 255)');
	});

	test("a segments entry keyed by series name overrides that one series' color", async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			segments: {
				Female: [{ styles: { fill: '#ff0000' } }]
			} satisfies SegmentsConfig<BarSegmentStyle>
		});
		const svg = await waitForSvg(container);
		const fills = new Set(barFills(svg));
		expect(fills).toContain('rgb(255, 0, 0)');
	});
});
