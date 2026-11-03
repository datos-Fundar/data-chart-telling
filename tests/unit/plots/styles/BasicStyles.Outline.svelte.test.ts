import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import ViolinPlot from '$lib/plots/distribution/violin/Plot.svelte';
import {
	HEIGHT_DENSITY,
	PROVINCE_VALUES,
	PROVINCE_LIFE,
	POPULATION_BY_AGE,
	HEIGHTS,
	IRIS
} from '$datasets';

// An outline asked for with a width and no color takes the color of the fill it goes around - the series' -
// on every plot that draws an area. `styles.area` is how every series is drawn, over its own color.

const kinds: [string, unknown, Record<string, unknown>][] = [
	['AreaPlot', AreaPlot, { data: HEIGHT_DENSITY, x: 'height', y: 'density', color: 'sex' }],
	['BarPlot', BarPlot, { data: PROVINCE_VALUES, x: 'province', y: 'value', color: 'sex' }],
	[
		'BulletPlot',
		BulletPlot,
		{ data: PROVINCE_LIFE, x: 'female', y: 'province', ranges: [76, 85], tgt: 0 }
	],
	[
		'PyramidPlot',
		PyramidPlot,
		{
			data: POPULATION_BY_AGE.filter((d) => d.year === 2022),
			x: 'share',
			y: 'ageGroup',
			color: 'sex'
		}
	],
	['HistogramPlot', HistogramPlot, { data: HEIGHTS, x: 'height', grouping: 'group' }],
	['BoxPlot', BoxPlot, { data: IRIS, x: 'species', y: 'petalLength', color: 'species' }],
	['DensityPlot', DensityPlot, { data: HEIGHTS, x: 'height', grouping: 'group' }],
	['ViolinPlot', ViolinPlot, { data: IRIS, x: 'species', y: 'sepalLength', color: 'species' }]
];

async function marks(component: unknown, props: Record<string, unknown>, area: object) {
	const { tgt, ...rest } = props;
	void tgt;
	const { container } = await render(
		component as never,
		{
			props: { width: 600, height: 400, ...rest, styles: { area } }
		} as never
	);
	await vi.waitFor(() => {
		if (!container.querySelector('svg')) throw new Error('not yet rendered');
	});
	await new Promise((resolve) => setTimeout(resolve, 150));
	return [...container.querySelectorAll<SVGElement>('svg *')]
		.filter((el) => !el.closest('.dct-discrete'))
		.map((el) => getComputedStyle(el))
		.map((style) => ({ fill: style.fill, stroke: style.stroke, width: style.strokeWidth }));
}

describe('the outline of an area', () => {
	test.each(kinds)('%s outlines in the color of its fill', async (_name, component, props) => {
		const outlined = (await marks(component, props, { strokeWidth: 3 })).filter(
			(m) => m.width === '3px' && m.fill !== 'none' && m.stroke !== 'none'
		);
		expect(outlined.length).toBeGreaterThan(0);
		for (const m of outlined) expect(m.stroke).toBe(m.fill);
	});

	test.each(kinds)('%s takes the color the style gives it', async (_name, component, props) => {
		const outlined = (
			await marks(component, props, { strokeWidth: 3, stroke: 'rgb(1, 2, 3)' })
		).filter((m) => m.width === '3px' && m.fill !== 'none');
		expect(outlined.length).toBeGreaterThan(0);
		expect(outlined.every((m) => m.stroke === 'rgb(1, 2, 3)')).toBe(true);
	});
});
