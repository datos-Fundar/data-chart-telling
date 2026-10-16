import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { buildScatterDefaults } from '$lib/plots/scatter/defaults';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';

type Row = Record<string, unknown>;

/** The domains a scatter's own `scales.fit` leaves on `x`, over `xs` and a dot of `radius` pixels. */
function domainOf(xs: number[], radius: number, width = 240) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, {});
	const state = Pipeline.ofAxisKind(buildScatterDefaults<Row>()).run(
		{
			data: xs.map((x) => ({ x, y: 0 })),
			x: 'x',
			y: 'y',
			r: radius,
			width,
			height: 300,
			margins: { left: 20, right: 20, top: 20, bottom: 20 },
			scales: {},
			segments: {},
			markers: []
		},
		{ cfg: DEFAULT_CONFIG, interaction }
	) as { scales: { x?: { domain?: number[] } } };
	return state.scales.x?.domain;
}

describe('ScatterPlot scales.fit', () => {
	test('pads both ends of the domain proportional to the pixel radius', () => {
		// 200px of plot over [0, 100] -> 0.5 data units per pixel; a 10px radius pads by 5.
		const [min, max] = domainOf([0, 50, 100], 10)!;
		expect(min).toBeCloseTo(-5);
		expect(max).toBeCloseTo(105);
	});

	test('a larger radius pads more', () => {
		const [minSmall] = domainOf([0, 100], 5)!;
		const [minLarge] = domainOf([0, 100], 20)!;
		expect(minLarge).toBeLessThan(minSmall);
	});

	test('a narrower plot pads more, for the same radius', () => {
		const [minWide] = domainOf([0, 100], 10, 440)!;
		const [minNarrow] = domainOf([0, 100], 10, 140)!;
		expect(minNarrow).toBeLessThan(minWide);
	});

	test('a degenerate single-value domain pads by a fixed unit instead of dividing by zero', () => {
		expect(domainOf([42, 42, 42], 10)).toEqual([41, 43]);
	});
});
