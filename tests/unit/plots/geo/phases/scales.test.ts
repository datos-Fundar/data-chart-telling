import { describe, test, expect } from 'vitest';
import { buildScales } from '$lib/plots/geo/phases/scales';
import type { GeoPlotState, GeoPlotCtx } from '$lib/types/plots/geo/state';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { ChartConfig } from '$lib/types/configuration/styling';

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

const FEATURES = [feature('a', 10), feature('b', 20), feature('c', 30)];

const CTX: GeoPlotCtx<Props> = {
	cfg: {} as ChartConfig,
	minColor: '#000000',
	maxColor: '#ffffff',
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
		value: (f) => (f.properties as Props).pop,
		...overrides
	};
	return buildScales(state, { ...CTX, ...ctxOverrides });
}

describe('buildScales – no value accessor', () => {
	test('colorScale is null when no value accessor is given', () => {
		const result = build({ value: undefined });
		expect(result.colorScale).toBeNull();
	});
});

describe('buildScales – computed domain', () => {
	test('a value with no data at all leaves colorScale null', () => {
		const result = build({ features: [] });
		expect(result.colorScale).toBeNull();
	});

	test('domain spans the min/max of every feature value', () => {
		const result = build();
		expect(result.colorScale!(10)).not.toBe(result.colorScale!(30));
	});

	test('an explicit scales.color.domain wins over the computed extent', () => {
		const withExplicit = build({ scales: { color: { domain: [0, 100] } } });
		const withComputed = build();
		// 10 sits near the bottom of the computed [10,30] extent but far from
		// the bottom of an explicit [0,100] one — the resulting colors differ.
		expect(withExplicit.colorScale!(10)).not.toBe(withComputed.colorScale!(10));
	});
});

describe('buildScales – legend range', () => {
	test("'rescale' mode reprojects the color domain onto the narrowed range", () => {
		const full = build();
		const rescaled = build({}, { range: { min: 0, max: 15, mode: 'rescale', disabledStyle: {} } });
		expect(full.colorScale!(15)).not.toBe(rescaled.colorScale!(15));
	});

	test("'filter' mode leaves the color domain untouched", () => {
		const full = build();
		const filtered = build({}, { range: { min: 0, max: 15, mode: 'filter', disabledStyle: {} } });
		expect(full.colorScale!(15)).toBe(filtered.colorScale!(15));
	});
});
