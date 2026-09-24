import { describe, test, expect } from 'vitest';
import { buildScales } from '$lib/plots/heatmap/phases/scales';
import type { HeatmapPlotState, HeatmapPlotCtx } from '$lib/types/plots/heatmap/state';
import type { ChartConfig } from '$lib/types/configuration/styling';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { row: string; col: string; value: number };

const FLAT: Row[] = [
	{ row: 'X', col: 'A', value: 10 },
	{ row: 'Y', col: 'B', value: -5 },
	{ row: 'X', col: 'B', value: 20 }
];

const CTX: HeatmapPlotCtx = {
	cfg: {} as ChartConfig,
	minColor: '#000000',
	maxColor: '#ffffff',
	range: undefined
};

function build(
	overrides: Partial<HeatmapPlotState<Row>> = {},
	ctxOverrides: Partial<HeatmapPlotCtx> = {}
) {
	const state: HeatmapPlotState<Row> = {
		segments: {},
		scales: {},
		width: 400,
		height: 300,
		flat: FLAT,
		channels: {
			x: { accessor: (d) => d.col },
			y: { accessor: (d) => d.row },
			z: { accessor: (d) => d.value }
		},
		...overrides
	};
	return buildScales(state, { ...CTX, ...ctxOverrides });
}

describe('buildScales – x/y band domains', () => {
	test('collects every distinct category on each axis, in first-seen order', () => {
		const { scales } = build();
		expect(scales.x?.domain).toEqual(['A', 'B']);
		expect(scales.y?.domain).toEqual(['X', 'Y']);
		expect(scales.x?.type).toBe('band');
		expect(scales.y?.type).toBe('band');
	});

	test('an explicit scales.x/.y config wins over the computed domain', () => {
		const { scales } = build({ scales: { x: { domain: ['Z'] } } });
		expect(scales.x?.domain).toEqual(['Z']);
	});
});

describe('buildScales – value domain', () => {
	test('spans [min(0, dataMin), dataMax] when scales.z.domain is not set', () => {
		const result = build();
		// -5 to 20, clamped to include 0 on the low end since the data min (-5) is already below it.
		expect(result.colorScale!(20)).not.toBe(result.colorScale!(-5));
	});

	test('an explicit scales.z.domain wins over the computed one', () => {
		const withExplicit = build({ scales: { z: { domain: [0, 100] } } });
		const withComputed = build();
		// A value of 20 sits near the top of the computed domain but near the
		// bottom of the explicit [0, 100] one — the resulting colors differ.
		expect(withExplicit.colorScale!(20)).not.toBe(withComputed.colorScale!(20));
	});
});

describe('buildScales – legend range', () => {
	test("'rescale' mode reprojects the color domain onto the narrowed range", () => {
		const full = build();
		const rescaled = build({}, { range: { min: 0, max: 10, mode: 'rescale', disabledStyle: {} } });
		expect(full.colorScale!(10)).not.toBe(rescaled.colorScale!(10));
	});

	test("'filter' mode leaves the color domain untouched", () => {
		const full = build();
		const filtered = build({}, { range: { min: 0, max: 10, mode: 'filter', disabledStyle: {} } });
		expect(full.colorScale!(10)).toBe(filtered.colorScale!(10));
	});
});
