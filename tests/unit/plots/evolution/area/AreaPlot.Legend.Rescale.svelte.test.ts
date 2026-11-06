import { render } from 'vitest-browser-svelte';
import { describe, expect, test } from 'vitest';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { AGE_SHARES_BY_YEAR, PROVINCE_VALUES } from '$datasets';
import { waitForSvg } from '../../_helpers/svg';

/** The highest tick the value axis writes. */
const topTick = (svg: SVGElement, axis: 'x' | 'y') =>
	Math.max(
		...Array.from(svg.querySelectorAll(`g.axis-${axis} text`)).map((t) =>
			Number(t.textContent?.replace(/\./g, '').replace(',', '.'))
		)
	);

describe('A stack whose legend takes a series out', () => {
	const stacked = (mode: 'omit' | 'rescale') =>
		render(AreaPlot, {
			width: 800,
			height: 400,
			data: AGE_SHARES_BY_YEAR,
			x: 'year',
			y: 'share',
			color: 'ageGroup',
			transforms: [{ type: 'stackY' }],
			legend: { off: { '65+': { mode } } }
		});

	test("'omit' closes the stack over it: the top drops to what the rest add up to", async () => {
		const svg = await waitForSvg((await stacked('omit')).container);
		expect(topTick(svg, 'y')).toBeGreaterThan(0);
		expect(topTick(svg, 'y')).toBeLessThan(100);
	});

	test("'rescale' scales the rest up to the whole each year had", async () => {
		const svg = await waitForSvg((await stacked('rescale')).container);
		expect(topTick(svg, 'y')).toBe(100);
	});

	test("'rescale' keeps a stacked bar's categories at their own totals", async () => {
		const bars = (mode?: 'rescale') =>
			render(BarPlot, {
				width: 800,
				height: 400,
				data: PROVINCE_VALUES,
				x: 'province',
				y: 'value',
				color: 'sex',
				transforms: [{ type: 'stackY' }],
				...(mode ? { legend: { off: { male: { mode } } } } : {})
			});
		const all = await waitForSvg((await bars()).container);
		const rescaled = await waitForSvg((await bars('rescale')).container);
		// The female bars alone reach the height both sexes reached together.
		expect(topTick(all, 'y')).toBeGreaterThan(100);
		expect(topTick(rescaled, 'y')).toBe(topTick(all, 'y'));
	});
});
