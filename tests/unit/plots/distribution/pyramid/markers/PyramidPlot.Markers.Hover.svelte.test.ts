import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { AGE_GROUPS, POPULATION_BY_AGE } from '$datasets';
import { waitForSvg, countHoverAreas } from '../../../_helpers/svg';

const DATA_PROPS = {
	data: POPULATION_BY_AGE.filter((d) => d.year === 2022),
	x: 'share' as const,
	y: 'ageGroup' as const,
	color: 'sex' as const,
	scales: { y: { domain: AGE_GROUPS } }
};

// A pyramid's category axis (age group) is always drawn on y, so only a band
// along y has a band scale to size itself against - one along x (the diverging
// magnitude axis) draws nothing, same as it would be on a vertical bar chart's
// value axis. svelteplot's <Pointer> matches by nearest-point distance here
// (no dedicated hit area), so - as with BarPlot's own hover test note -
// these stay static (no-hover) baseline checks rather than simulating a
// real hover.
describe('PyramidPlot - markers.hover bands', () => {
	test('renders with a band along y and shows no highlight before any hover', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			markers: [
				{ type: 'hover', back: [{ type: 'band', axis: 'y', value: (p) => p.y }] }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countHoverAreas(svg)).toBe(0);
	});

	test('does not crash with a band along x (drawing nothing on the magnitude axis) beside one along y', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			markers: [
				{
					type: 'hover',
					back: [
						{ type: 'band', axis: 'x', value: (p) => p.x },
						{ type: 'band', axis: 'y', value: (p) => p.y }
					]
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
