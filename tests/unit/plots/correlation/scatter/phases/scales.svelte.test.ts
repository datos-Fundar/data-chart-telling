import { describe, test, expect } from 'vitest';
import { buildScatterDefaults } from '$lib/plots/correlation/scatter/defaults';
import { TransformsPhase } from '$lib/phases/transforms/TransformsPhase';
import { stageOf } from '../../../_helpers/stages';
import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/correlation/scatter/state';
import type { Series } from '$lib/types/plots/data/common';
import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

const buildScales = stageOf(buildScatterDefaults<Row>(), 'scales');

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { x: number; y: number };

const FLAT: Row[] = [
	{ x: 0, y: 0 },
	{ x: 100, y: 100 }
];
const THEME_MARGINS = { top: 20, right: 20, bottom: 30, left: 40 };

function group(dotRadius?: number): VisualGroup<Series<Row>, ScatterSegmentStyle> {
	const series: Series<Row> = { name: 'a', x: 'x', y: 'y', data: FLAT };
	return { series, visualSegments: [{ data: FLAT, styles: { dotRadius } }] };
}

function build(overrides: Partial<ScatterPlotState<Row>> = {}, dotRadiusDefault = 4) {
	const state: ScatterPlotState<Row> = {
		segments: {},
		scales: {},
		width: 400,
		height: 300,
		margins: undefined,
		flat: FLAT,
		resolvedSeries: [{ name: 'a', x: 'x', y: 'y', data: FLAT }],
		channels: { x: { accessor: (d) => d.x }, y: { accessor: (d) => d.y } },
		groupedSeries: [group(dotRadiusDefault)],
		...overrides
	};
	const ctx: ScatterPlotCtx = {
		cfg: { margins: THEME_MARGINS, scatter: { dotRadius: dotRadiusDefault } } as PlotStylesConfig
	};
	return buildScales(new TransformsPhase<typeof state>().run(state, ctx), ctx).scales;
}

describe('buildScales - no padding needed', () => {
	test('returns scales unchanged when every dot renders at radius 0', () => {
		const result = build({ groupedSeries: [group(0)] }, 0);
		expect(result).toEqual({});
	});
});

describe('buildScales - domain padding', () => {
	test('pads both axes using a literal constant radius', () => {
		const result = build({
			channels: { x: { accessor: (d) => d.x }, y: { accessor: (d) => d.y }, r: 20 }
		});
		expect(result.x?.domain).toBeDefined();
		expect(result.y?.domain).toBeDefined();
		const [lo, hi] = result.x!.domain as [number, number];
		expect(lo).toBeLessThan(0);
		expect(hi).toBeGreaterThan(100);
	});

	test('falls back to the theme/segment dotRadius when r is unset', () => {
		const withSmallRadius = build({ groupedSeries: [group(2)] });
		const withLargeRadius = build({ groupedSeries: [group(40)] });
		const [, smallHi] = withSmallRadius.x!.domain as [number, number];
		const [, largeHi] = withLargeRadius.x!.domain as [number, number];
		expect(largeHi).toBeGreaterThan(smallHi);
	});

	test('pads using the auto-scale estimate when r is a channel (function)', () => {
		const result = build({
			channels: {
				x: { accessor: (d) => d.x },
				y: { accessor: (d) => d.y },
				r: { accessor: () => 1 }
			}
		});
		const [, channelHi] = result.x!.domain as [number, number];
		const constResult = build({
			channels: { x: { accessor: (d) => d.x }, y: { accessor: (d) => d.y }, r: 5 }
		});
		const [, constHi] = constResult.x!.domain as [number, number];
		// The channel case uses AUTO_SCALED_RADIUS_ESTIMATE (20px), well past a tiny literal 5px radius.
		expect(channelHi).toBeGreaterThan(constHi);
	});

	test('leaves an axis with an explicit domain untouched, still pads the other', () => {
		const result = build({
			scales: { x: { domain: [0, 100] } },
			channels: { x: { accessor: (d) => d.x }, y: { accessor: (d) => d.y }, r: 20 }
		});
		expect(result.x?.domain).toEqual([0, 100]);
		expect(result.y?.domain).toBeDefined();
	});
});
