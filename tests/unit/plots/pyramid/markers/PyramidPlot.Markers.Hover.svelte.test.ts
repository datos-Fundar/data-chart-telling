import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../../../../stories/data/population-pyramid';
import { waitForSvg, countHoverAreas } from '../../_helpers/svg';

const DATA_PROPS = {
	data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
	x: 'pct' as const,
	y: 'ageGroup' as const,
	color: 'sex' as const,
	scales: { y: { domain: AGE_GROUPS } }
};

// A pyramid's category axis (age group) is always drawn on y, so only
// `areaY` has a band scale to size itself against — `areaX` (the diverging
// magnitude axis) is a no-op, same as it would be on a vertical bar chart's
// value axis. svelteplot's <Pointer> matches by nearest-point distance here
// (no dedicated hit area), so — as with BarPlot's own hover test note —
// these stay static (no-hover) baseline checks rather than simulating a
// real hover.
describe('PyramidPlot – markers.hover areaX/areaY', () => {
	test('renders with areaY configured and shows no highlight before any hover', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			markers: [{ type: 'hover', areaY: true }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countHoverAreas(svg)).toBe(0);
	});

	test('does not crash with areaX (a no-op on the diverging magnitude axis) alongside areaY', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			markers: [
				{ type: 'hover', areaX: true, areaY: true, areaStyle: { fill: '#e11d48' } }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
