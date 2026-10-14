import { describe, test, expect } from 'vitest';
import { TransformsPhase } from '$lib/phases/transforms/TransformsPhase';
import { buildGroupedSeries } from '$lib/plots/utils/segments';
import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/scatter/state';
import type { Series } from '$lib/types/plots/data/common';
import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { DotMarkerConfig } from '$lib/types/markers/common';
import type { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { stageOf } from '../../_helpers/stages';
import { buildScatterDefaults } from '$lib/plots/scatter/defaults';

/** The kind's "markers" stage: its own marks, the state's markers, then its value labels. */
const buildMarkers = stageOf(buildScatterDefaults<Row>(), 'markers');

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { x: number; y: number; population: number };

const DATA: Row[] = [{ x: 1, y: 10, population: 42 }];
const SERIES: Series<Row> = { name: 'a', x: 'x', y: 'y', data: DATA };

function build(
	overrides: Partial<ScatterPlotState<Row>> = {},
	ctxOverrides: Partial<ScatterPlotCtx> = {}
) {
	const state: ScatterPlotState<Row> = {
		segments: {},
		scales: {},
		width: 400,
		height: 300,
		resolvedSeries: [SERIES],
		groupedSeries: buildGroupedSeries<Series<Row>, ScatterSegmentStyle>([SERIES], {}, false),
		channels: { x: { accessor: (d) => d.x }, y: { accessor: (d) => d.y } },
		colorForSeries: () => 'blue',
		...overrides
	};
	const ctx: ScatterPlotCtx = {
		cfg: { scatter: { dotRadius: 4 } } as PlotStylesConfig,
		...ctxOverrides
	};
	// No `authorMarkers`/`statistics` given, so the real output is exactly
	// this phase's own dots - narrowed back from the state's broader
	// accumulating `markers` union.
	return buildMarkers(new TransformsPhase<typeof state>().run(state, ctx), ctx)
		.markers as DotMarkerConfig[];
}

describe('buildMarkers - radius channel', () => {
	test('leaves r undefined when no radius was given', () => {
		const [marker] = build();
		expect(marker.r).toBeUndefined();
	});

	test('passes a literal radius through as-is', () => {
		const [marker] = build({
			channels: { x: { accessor: (d) => d.x }, y: { accessor: (d) => d.y }, r: 12 }
		});
		expect(marker.r).toBe(12);
	});

	test('unwraps a resolved channel into a plain accessor function', () => {
		const [marker] = build({
			channels: {
				x: { accessor: (d) => d.x },
				y: { accessor: (d) => d.y },
				r: { accessor: (d) => d.population }
			}
		});
		expect(typeof marker.r).toBe('function');
		expect((marker.r as (d: Row) => number)(DATA[0])).toBe(42);
	});
});

describe('buildMarkers - style resolution', () => {
	test('falls back to the default color when a segment has none of its own', () => {
		const [marker] = build({ colorForSeries: () => 'green' });
		expect(marker.styles?.dotFill).toBe('green');
	});

	test('a disabled-dots override wins over the segment/default color', () => {
		const [marker] = build(
			{ colorForSeries: () => 'green' },
			{
				interaction: {
					dotsFor: () => ({ dotFill: 'gray', dotFillOpacity: 0.3 })
				} as unknown as PlotInteraction
			}
		);
		expect(marker.styles?.dotFill).toBe('gray');
		expect(marker.styles?.dotFillOpacity).toBe(0.3);
	});
});
