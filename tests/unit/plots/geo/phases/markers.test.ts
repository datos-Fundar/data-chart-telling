import { describe, test, expect } from 'vitest';
import { buildMarkers } from '$lib/plots/geo/phases/markers';
import type { GeoPlotState, GeoPlotCtx, TaggedGeoFeature } from '$lib/types/plots/geo/state';
import type { ChartConfig } from '$lib/types/configuration/styling';
import type { GeoFeaturesMarkerConfig } from '$lib/types/markers/geo';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Props = { pop: number };

function feature(id: string, pop: number): TaggedGeoFeature<Props> {
	return {
		type: 'Feature',
		id,
		properties: { pop },
		geometry: { type: 'Point', coordinates: [0, 0] },
		__id: id,
		__cx: 0,
		__cy: 0
	} as unknown as TaggedGeoFeature<Props>;
}

const CTX: GeoPlotCtx<Props> = {
	cfg: { palette: ['red'], axis: { color: '#333' } } as unknown as ChartConfig,
	range: undefined
};

function build(
	overrides: Partial<GeoPlotState<Props>> = {},
	ctxOverrides: Partial<GeoPlotCtx<Props>> = {}
) {
	const state: GeoPlotState<Props> = {
		rawFeatures: [],
		segments: {},
		scales: {},
		authoredMarkers: [],
		width: 400,
		height: 300,
		features: [feature('a', 10)],
		...overrides
	};
	return buildMarkers(state, { ...CTX, ...ctxOverrides });
}

describe('buildMarkers – style grouping', () => {
	test('one base geo marker for the whole set when no segment splits it', () => {
		const { markers } = build();
		const geoMarkers = markers!.filter((m) => m.type === 'geo');
		expect(geoMarkers).toHaveLength(1);
		expect((geoMarkers[0] as GeoFeaturesMarkerConfig).data).toHaveLength(1);
	});

	test('a feature-specific segment style splits it into its own bucket', () => {
		const { markers } = build({
			features: [feature('a', 10), feature('b', 20)],
			segments: { a: [{ styles: { fill: 'red' } }] }
		});
		const geoMarkers = markers!.filter((m) => m.type === 'geo') as GeoFeaturesMarkerConfig[];
		expect(geoMarkers).toHaveLength(2);
	});
});

describe('buildMarkers – base fill resolution', () => {
	test('uses resolveColor(f) when set', () => {
		const { markers } = build({ resolveColor: () => 'color-10' });
		const [marker] = markers!.filter((m) => m.type === 'geo') as GeoFeaturesMarkerConfig[];
		expect(marker.fill(feature('a', 10))).toBe('color-10');
	});

	test('falls back to ctx.fill, then cfg.palette[0], when no resolveColor', () => {
		const { markers } = build({}, { fill: 'steelblue' });
		const [marker] = markers!.filter((m) => m.type === 'geo') as GeoFeaturesMarkerConfig[];
		expect(marker.fill(feature('a', 10))).toBe('steelblue');
	});
});

describe('buildMarkers – legend range dimming', () => {
	test('a feature outside the active range gets the disabled-style override', () => {
		const { markers } = build(
			{ color: (f) => (f.properties as Props).pop },
			{ range: { min: 0, max: 5, mode: 'filter', disabledStyle: { opacity: 0.2 } } }
		);
		const [marker] = markers!.filter((m) => m.type === 'geo') as GeoFeaturesMarkerConfig[];
		expect(marker.fillOpacity).toBe(0.2);
	});
});

describe('buildMarkers – draw order', () => {
	test('a behind marker sorts before the base map, front markers after, hover last', () => {
		const { markers } = build({
			authoredMarkers: [
				{ type: 'geo-hover' } as never,
				{ type: 'dot', data: [] } as never,
				{ type: 'graticule', behind: true } as never
			]
		});
		expect(markers!.map((m) => m.type)).toEqual(['graticule', 'geo', 'dot', 'geo-hover']);
	});
});
