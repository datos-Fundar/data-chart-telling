import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
import { COUNTRIES } from '../../../../stories/plots/scatter/data';
import { waitForSvg } from '../../plots/_helpers/svg';

function shapesOf(svg: SVGElement): string[] {
	return Array.from(svg.querySelectorAll('g.dot path')).map((el) => el.getAttribute('d') ?? '');
}

describe('symbol channel - plot level (Scatter)', () => {
	test('a symbol accessor maps each category to its own distinct shape', async () => {
		const { container } = render(ScatterPlot, {
			width: 600,
			height: 400,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			symbol: 'region',
			scales: {
				symbol: {
					domain: ['Americas', 'Europe', 'Asia'],
					range: ['circle', 'square', 'triangle']
				}
			}
		});
		const svg = await waitForSvg(container);
		const shapes = shapesOf(svg);
		expect(shapes.length).toBe(COUNTRIES.length);

		// Every row of the same region must render the identical shape path,
		// and at least two distinct regions must render different shapes.
		const byRegion = new Map<string, Set<string>>();
		COUNTRIES.forEach((c, i) => {
			if (!byRegion.has(c.region)) byRegion.set(c.region, new Set());
			byRegion.get(c.region)!.add(shapes[i]);
		});
		for (const shapeSet of byRegion.values()) {
			expect(shapeSet.size).toBe(1);
		}
		expect(new Set(shapes).size).toBeGreaterThan(1);
	});

	test('no symbol accessor renders every dot as the default circle', async () => {
		const { container } = render(ScatterPlot, {
			width: 600,
			height: 400,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy'
		});
		const svg = await waitForSvg(container);
		expect(new Set(shapesOf(svg)).size).toBe(1);
	});

	/**
	 * Regression: `color`/`grouping` splits the plot's own data into one
	 * series per category, so `symbol`'s domain can't be computed from just
	 * one marker call's own (single-category) slice - it collapsed to
	 * whichever shape sits at index 0 for every series until
	 * `scatter/markers.ts` started computing it once, globally, from
	 * `state.flat`, and passing it down as an explicit `scales.symbol.domain`.
	 */
	test('symbol still varies correctly when color also splits data into series', async () => {
		const { container } = render(ScatterPlot, {
			width: 600,
			height: 400,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			color: 'region',
			symbol: 'region',
			scales: { symbol: { range: ['triangle', 'circle', 'square'] } }
		});
		const svg = await waitForSvg(container);
		expect(new Set(shapesOf(svg)).size).toBeGreaterThan(1);
	});
});

describe('symbol channel - default shape cycle (cfg.symbols)', () => {
	afterEach(() => resetConfiguration());

	const SIX_KINDS = ['a', 'b', 'c', 'd', 'e', 'f'].map((kind, i) => ({ x: i, y: i, kind }));

	test('with no scales.symbol, the default cycle follows cfg.symbols in order', async () => {
		// If `cfg.symbols` really is `['circle','square','triangle','diamond','star','cross']`,
		// in that order, an explicit `range` naming the same six shapes in the
		// same order must render an identical shape sequence to leaving
		// `scales.symbol` unset entirely.
		const withDefault = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: SIX_KINDS,
			x: 'x',
			y: 'y',
			symbol: 'kind'
		});
		const defaultSvg = await waitForSvg(withDefault.container);
		const defaultShapes = shapesOf(defaultSvg);
		expect(new Set(defaultShapes).size).toBe(6);

		const withExplicit = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: SIX_KINDS,
			x: 'x',
			y: 'y',
			symbol: 'kind',
			scales: {
				symbol: { range: ['circle', 'square', 'triangle', 'diamond', 'star', 'cross'] }
			}
		});
		const explicitSvg = await waitForSvg(withExplicit.container);
		expect(shapesOf(explicitSvg)).toEqual(defaultShapes);
	});

	test('setConfiguration can override the default shape cycle', async () => {
		setConfiguration({ symbols: ['square', 'circle'] });
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: SIX_KINDS.slice(0, 2),
			x: 'x',
			y: 'y',
			symbol: 'kind'
		});
		const svg = await waitForSvg(container);

		const reference = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: SIX_KINDS.slice(0, 2),
			x: 'x',
			y: 'y',
			symbol: 'kind',
			scales: { symbol: { range: ['square', 'circle'] } }
		});
		const referenceSvg = await waitForSvg(reference.container);
		expect(shapesOf(svg)).toEqual(shapesOf(referenceSvg));
	});
});
