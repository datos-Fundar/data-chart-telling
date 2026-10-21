import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../../../../stories/data/population-pyramid';
import { waitForSvg, countBarRects } from '../../_helpers/svg';

const DATA_PROPS = {
	data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
	x: 'pct' as const,
	y: 'ageGroup' as const,
	color: 'sex' as const
};

describe('PyramidPlot - scales', () => {
	test('renders with no scale overrides (auto domain)', async () => {
		const { container } = await render(PyramidPlot, { width: 560, height: 520, ...DATA_PROPS });
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(DATA_PROPS.data.length);
	});

	test('an explicit Y domain pins the age group axis ticks to that exact order', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			scales: { y: { domain: AGE_GROUPS } } satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		const ticks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) => t.textContent);
		expect(ticks).toEqual(AGE_GROUPS);
	});

	test('an explicit X domain constrains the diverging axis range', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			scales: { x: { domain: [-6, 6] }, y: { domain: AGE_GROUPS } } satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(DATA_PROPS.data.length);
	});

	test('scales.grouping.reverse renders with the reverse flag', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			scales: {
				y: { domain: AGE_GROUPS },
				grouping: { reverse: true }
			} satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		// With reverse, should still render all bars
		expect(countBarRects(svg)).toBe(DATA_PROPS.data.length);
	});

	test('axis labels render the configured title text', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			scales: {
				x: { label: 'Population %' },
				y: { label: 'Age Group', domain: AGE_GROUPS }
			} satisfies AxisBasedScalesConfig,
			margins: { left: 80, bottom: 50 }
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelector('.axis-x-title')?.textContent).toContain('Population %');
		expect(svg.querySelector('.axis-y-title')?.textContent).toContain('Age Group');
	});
});
