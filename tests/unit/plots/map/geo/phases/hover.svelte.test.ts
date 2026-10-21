import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { buildHover, isOverInset } from '$lib/plots/map/geo/phases/hover';
import type { GeoPlotState, GeoPlotCtx, TaggedGeoFeature } from '$lib/types/plots/map/geo/state';

type Props = { v?: number };

const feature = (id: string, v: number | undefined, cx: number, cy: number) =>
	({ __id: id, __cx: cx, __cy: cy, properties: { v } }) as unknown as TaggedGeoFeature<Props>;

const FEATURES = [
	feature('A', 1, 10, 20),
	feature('B', 5, 30, 40),
	feature('C', undefined, 50, 60)
];

function run(
	state: Partial<GeoPlotState<Props>> = {},
	range?: GeoPlotCtx<Props>['range']
): GeoPlotState<Props> {
	return buildHover(
		{
			features: FEATURES,
			authoredMarkers: [],
			tooltipFormat: (f) => String((f as unknown as TaggedGeoFeature<Props>).__id),
			...state
		} as GeoPlotState<Props>,
		{ cfg: DEFAULT_CONFIG, range } as GeoPlotCtx<Props>
	);
}

const color = (f: unknown) => (f as { properties: Props }).properties.v;

describe('GeoPlot "hover" phase', () => {
	test('every feature is a candidate at its centroid, read as its id', () => {
		const { hover, hoverPosition, hoverRows } = run();
		expect(hover!.points.map((p) => [p.x, p.y, p.label])).toEqual([
			[10, 20, 'A'],
			[30, 40, 'B'],
			[50, 60, 'C']
		]);
		expect(hoverRows).toBe(FEATURES);
		expect(hoverPosition!.x(FEATURES[1] as never)).toBe(30);
		expect(hoverPosition!.y(FEATURES[1] as never)).toBe(40);
	});

	test('it matches the feature under the cursor, one at a time, with no crosshair', () => {
		const { hover } = run({ tooltip: { strategy: 'x' } as never });
		expect(hover).toMatchObject({
			strategy: 'punctual',
			pointMatching: 'contains',
			crosshair: false
		});
		expect(hover!.exclude).toBe(isOverInset);
	});

	test('a feature outside the legend range is left out, while one with no color value stays', () => {
		const range = { min: 0, max: 2, mode: 'filter', disabledStyle: {} } as const;
		const { hover } = run({ color: color as never }, range);
		expect(hover!.points.map((p) => p.label)).toEqual(['A', 'C']);
	});

	test('without a color or a range nothing is filtered', () => {
		const range = { min: 0, max: 2, mode: 'filter', disabledStyle: {} } as const;
		expect(run({}, range).hover!.points).toHaveLength(3);
		expect(run({ color: color as never }).hover!.points).toHaveLength(3);
	});

	test('it is active with a tooltip or a hover marker, and the tooltip reads as the features id', () => {
		expect(run().hover!.active).toBe(false);
		expect(run({ tooltip: true }).hover!.active).toBe(true);
		expect(run({ authoredMarkers: [{ type: 'geo-hover' }] as never }).hover!.active).toBe(true);
		const { hover } = run({ tooltip: {} as never });
		expect(hover!.tooltip!.format!(FEATURES[0] as never)).toBe('A');
	});
});

describe('isOverInset', () => {
	test('is true only over an inset panel', () => {
		const inset = document.createElement('div');
		inset.className = 'dct-geo-inset';
		const child = document.createElement('span');
		inset.append(child);
		expect(isOverInset({ target: child } as unknown as PointerEvent)).toBe(true);
		expect(isOverInset({ target: document.createElement('span') } as unknown as PointerEvent)).toBe(
			false
		);
	});
});
