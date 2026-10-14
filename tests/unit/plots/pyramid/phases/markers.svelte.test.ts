import { describe, test, expect } from 'vitest';
import { TransformsPhase } from '$lib/phases/transforms/TransformsPhase';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { buildGroupedSeries } from '$lib/plots/utils/segments';
import type {
	PyramidPlotState,
	PyramidPlotCtx,
	PyramidSeries
} from '$lib/types/plots/pyramid/state';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { stageOf } from '../../_helpers/stages';
import { buildPyramidDefaults } from '$lib/plots/pyramid/defaults';

/** The kind's "markers" stage: its own marks, the state's markers, then its value labels. */
const buildMarkers = stageOf(buildPyramidDefaults<Row>(), 'markers');

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { ageGroup: string; pct: number | null };

const CTX: PyramidPlotCtx = {
	cfg: { palette: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'] } as PlotStylesConfig
};

function series(name: string, side: 'left' | 'right', data: Row[]): PyramidSeries<Row> {
	return { name, x: 'pct', y: 'ageGroup', data, side };
}

function build(
	overrides: Partial<PyramidPlotState<Row>> = {},
	ctxOverrides: Partial<PyramidPlotCtx> = {}
) {
	const groupedSeries =
		overrides.groupedSeries ??
		buildGroupedSeries<PyramidSeries<Row>, BarSegmentStyle>(
			[series('Female', 'left', [{ ageGroup: '0-4', pct: 10 }])],
			{},
			false
		);
	const state: PyramidPlotState<Row> = {
		segments: {},
		gaps: {},
		scales: {},
		width: 400,
		height: 300,
		axes: PlotAxes.build({
			series: [{ x: 'pct', y: 'ageGroup', data: [{ pct: 1, ageGroup: 'a' }] }],
			discrete: 1
		}),
		groupedSeries,
		resolvedSeries: groupedSeries.map((g) => g.series),
		gapFillMaps: new Map(),
		colorForSeries: (name: string) => (name === 'Female' ? 'blue' : 'orange'),
		...overrides
	};
	// No `authorMarkers`/`statistics` given, so the real output is exactly
	// this phase's own segment/gap-fill bars - narrowed back from the state's
	// broader accumulating `markers` union.
	const ctx = { ...CTX, ...ctxOverrides };
	return buildMarkers(new TransformsPhase<typeof state>().run(state, ctx), ctx)
		.markers as BarMarkerConfig[];
}

describe('buildMarkers - geometry', () => {
	test('is always horizontal, category on y, baseline x1 at zero', () => {
		const [marker] = build();
		expect(marker.isHorizontal).toBe(true);
		expect(marker.x1).toBe(0);
	});

	test('signs x2 negative for a left-side series, positive for a right-side one', () => {
		const leftGroup = buildGroupedSeries<PyramidSeries<Row>, BarSegmentStyle>(
			[series('Female', 'left', [{ ageGroup: '0-4', pct: 10 }])],
			{},
			false
		);
		const rightGroup = buildGroupedSeries<PyramidSeries<Row>, BarSegmentStyle>(
			[series('Male', 'right', [{ ageGroup: '0-4', pct: 10 }])],
			{},
			false
		);
		const [left] = build({ groupedSeries: leftGroup });
		const [right] = build({ groupedSeries: rightGroup });
		const row: Row = { ageGroup: '0-4', pct: 10 };
		expect((left.x2 as (d: Row) => number)(row)).toBe(-10);
		expect((right.x2 as (d: Row) => number)(row)).toBe(10);
	});

	test('skips a segment with no real (non-gap) rows', () => {
		const groupedSeries = buildGroupedSeries<PyramidSeries<Row>, BarSegmentStyle>(
			[series('Female', 'left', [{ ageGroup: '0-4', pct: null }])],
			{},
			false
		);
		const markers = build({ groupedSeries });
		expect(markers).toHaveLength(0);
	});
});

describe('buildMarkers - style resolution', () => {
	test('uses the series color when a segment has none of its own', () => {
		const [marker] = build();
		expect(marker.styles?.fill).toBe('blue');
	});

	test('a disabled-fill override wins over the series color', () => {
		const [marker] = build(
			{},
			{
				interaction: {
					fillFor: () => ({ fill: 'gray', fillOpacity: 0.3 })
				} as unknown as PlotInteraction
			}
		);
		expect(marker.styles?.fill).toBe('gray');
		expect(marker.styles?.fillOpacity).toBe(0.3);
	});
});

describe('buildMarkers - gap fills', () => {
	test('adds one extra marker per gap-fill kind present, at the interpolated signed value', () => {
		const female = series('Female', 'left', [{ ageGroup: '0-4', pct: null }]);
		const groupedSeries = buildGroupedSeries<PyramidSeries<Row>, BarSegmentStyle>(
			[female],
			{},
			false
		);
		const gapFillMaps = new Map([
			['Female', new Map([[female.data[0], { value: 5, kind: 'middle' as const, styles: {} }]])]
		]);
		const markers = build({ groupedSeries, gapFillMaps });
		expect(markers).toHaveLength(1);
		const x2 = markers[0].x2 as (d: unknown) => number;
		expect(x2(markers[0].data![0])).toBe(-5);
	});
});
