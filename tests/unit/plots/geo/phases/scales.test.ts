import { describe, test, expect } from 'vitest';
import { buildScales } from '$lib/plots/geo/phases/scales';
import type { GeoPlotState, GeoPlotCtx } from '$lib/types/plots/geo/state';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Props = { pop: number };

function feature(
	id: string,
	pop: number
): GeoFeature<Props> & { __id: string; __cx: number; __cy: number } {
	return {
		type: 'Feature',
		id,
		properties: { pop },
		geometry: { type: 'Point', coordinates: [0, 0] },
		__id: id,
		__cx: 0,
		__cy: 0
	} as GeoFeature<Props> & { __id: string; __cx: number; __cy: number };
}

const FEATURE_A = feature('a', 10);
const FEATURE_C = feature('c', 30);
const FEATURE_15 = feature('d', 15);
const FEATURES = [FEATURE_A, feature('b', 20), FEATURE_C];

const CTX: GeoPlotCtx<Props> = {
	cfg: { continuous: { min: '#000000', max: '#ffffff' } } as PlotStylesConfig,
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
		features: FEATURES,
		color: (f) => (f.properties as Props).pop,
		...overrides
	};
	return buildScales(state, { ...CTX, ...ctxOverrides });
}

describe('buildScales - no color accessor', () => {
	test('resolveColor is undefined when no color accessor is given', () => {
		const result = build({ color: undefined });
		expect(result.resolveColor).toBeUndefined();
	});
});

describe('buildScales - computed domain', () => {
	test('a color accessor with no data at all leaves resolveColor undefined', () => {
		const result = build({ features: [] });
		expect(result.resolveColor).toBeUndefined();
	});

	test('domain spans the min/max of every feature value', () => {
		const result = build();
		expect(result.resolveColor!(FEATURE_A)).not.toBe(result.resolveColor!(FEATURE_C));
	});

	test('an explicit scales.color.domain wins over the computed extent', () => {
		const withExplicit = build({ scales: { color: { domain: [0, 100] } } });
		const withComputed = build();
		// 10 sits near the bottom of the computed [10,30] extent but far from
		// the bottom of an explicit [0,100] one - the resulting colors differ.
		expect(withExplicit.resolveColor!(FEATURE_A)).not.toBe(withComputed.resolveColor!(FEATURE_A));
	});
});

describe('buildScales - legend range', () => {
	test("'rescale' mode reprojects the color domain onto the narrowed range", () => {
		const full = build();
		const rescaled = build({}, { range: { min: 0, max: 15, mode: 'rescale', disabledStyle: {} } });
		expect(full.resolveColor!(FEATURE_15)).not.toBe(rescaled.resolveColor!(FEATURE_15));
	});

	test("'filter' mode leaves the color domain untouched", () => {
		const full = build();
		const filtered = build({}, { range: { min: 0, max: 15, mode: 'filter', disabledStyle: {} } });
		expect(full.resolveColor!(FEATURE_15)).toBe(filtered.resolveColor!(FEATURE_15));
	});
});
