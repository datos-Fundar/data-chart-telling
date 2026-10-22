import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { resolveOpacityScale } from '$lib/utils/opacity';
import type { ArgentinaProvinceProps } from '../../../../stories/plots/map/geo/data';
import { ARGENTINA_PROVINCES } from '../../../../stories/plots/map/geo/data';
import { COUNTRIES_AT_2007 } from '$datasets';
import { waitForSvg, countCells, countGeoPaths } from '../../plots/_helpers/svg';

function opacitiesOf(svg: SVGElement, selector: string): number[] {
	return Array.from(svg.querySelectorAll(selector)).map((el) => {
		const style = el.getAttribute('style') ?? '';
		const match = style.match(/fill-opacity:\s*([\d.]+)/);
		return match ? Number(match[1]) : NaN;
	});
}

describe('opacity channel - plot level (Heatmap)', () => {
	const DATA = [
		{ x: 'a', y: 'row', v: 0 },
		{ x: 'b', y: 'row', v: 50 },
		{ x: 'c', y: 'row', v: 100 }
	];

	test('an opacity accessor with an explicit domain/range resolves each cell to its own exact opacity', async () => {
		const { container } = render(HeatmapPlot, {
			width: 400,
			height: 200,
			data: DATA,
			x: 'x',
			y: 'y',
			opacity: 'v',
			scales: { opacity: { domain: [0, 100], range: [0, 1] } }
		});
		const svg = await waitForSvg(container);
		expect(countCells(svg)).toBe(DATA.length);

		const scale = resolveOpacityScale({ domain: [0, 100], range: [0, 1] }, [0, 100], [0.2, 1]);
		const opacities = opacitiesOf(svg, 'g.cell rect');
		// Bucketed + quantized to 1/32 steps - compare rounded to avoid flakiness.
		expect(opacities.map((o) => Math.round(o * 32) / 32)).toEqual(
			DATA.map((d) => Math.round(scale(d.v) * 32) / 32)
		);
	});

	test('no opacity accessor leaves every cell at full opacity', async () => {
		const { container } = render(HeatmapPlot, {
			width: 400,
			height: 200,
			data: DATA,
			x: 'x',
			y: 'y'
		});
		const svg = await waitForSvg(container);
		expect(opacitiesOf(svg, 'g.cell rect').every((o) => o === 1)).toBe(true);
	});
});

describe('opacity channel - plot level (Geo)', () => {
	function nameOf(f: { properties: unknown }): string {
		return (f.properties as ArgentinaProvinceProps).nombre;
	}

	test('an opacity accessor dims features independently of color', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			color: () => 5,
			opacity: (f) => (nameOf(f) === 'Córdoba' ? 0 : 100),
			scales: {
				color: { domain: [0, 10], scheme: ['#ff0000', '#ff0000'] },
				opacity: { domain: [0, 100], range: [0, 1] }
			}
		});
		const svg = await waitForSvg(container);
		expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);

		// Bucketing groups by resolved (style, opacity) pair, not original data
		// order, so match by count rather than position: exactly one feature
		// (Córdoba) resolves to opacity 0, every other feature to opacity 1.
		const opacities = opacitiesOf(svg, 'g.geo path, path.geo');
		expect(opacities.filter((o) => o === 0)).toHaveLength(1);
		expect(opacities.filter((o) => o === 1)).toHaveLength(ARGENTINA_PROVINCES.length - 1);
	});
});

describe('opacity channel - plot level (Scatter)', () => {
	function dotOpacitiesOf(svg: SVGElement): number[] {
		return Array.from(svg.querySelectorAll('g.dot path')).map((el) => {
			const style = el.getAttribute('style') ?? '';
			const match = style.match(/fill-opacity:\s*([\d.]+)/);
			return match ? Number(match[1]) : NaN;
		});
	}

	/**
	 * Regression: same class of bug as `SymbolChannel.PlotLevel`'s own -
	 * `color` splits data into one series per continent, so `opacity`'s domain
	 * must be computed once, globally, across every series' combined rows,
	 * not per marker call (each of which only sees one series' own slice).
	 */
	test('opacity still varies correctly when color also splits data into series', async () => {
		const { container } = render(ScatterPlot, {
			width: 600,
			height: 400,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			color: 'continent',
			opacity: 'life'
		});
		const svg = await waitForSvg(container);
		expect(new Set(dotOpacitiesOf(svg)).size).toBeGreaterThan(1);
	});
});
