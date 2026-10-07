import { describe, test, expect } from 'vitest';
import { buildMarkers } from '$lib/plots/heatmap/phases/markers';
import { buildTransforms } from '$lib/layout/phases/transforms';
import type { HeatmapPlotState, HeatmapPlotCtx } from '$lib/types/plots/heatmap/state';
import type { ChartConfig } from '$lib/types/configuration/styling';
import type { CellMarkerConfig, TextMarkerConfig } from '$lib/types/markers/common';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { row: string; col: string; value: number };

const FLAT: Row[] = [
	{ row: 'X', col: 'A', value: 10 },
	{ row: 'Y', col: 'B', value: 20 }
];

const CTX: HeatmapPlotCtx = {
	cfg: { continuous: { min: '#000000', max: '#ffffff' } } as ChartConfig,
	range: undefined,
	legendInteraction: null
};

function buildAll(
	overrides: Partial<HeatmapPlotState<Row>> = {},
	ctxOverrides: Partial<HeatmapPlotCtx> = {}
) {
	const state: HeatmapPlotState<Row> = {
		segments: {},
		scales: {},
		width: 400,
		height: 300,
		flat: FLAT,
		resolvedSeries: [{ name: 'cells', x: 'col', y: 'row', data: FLAT }],
		channels: {
			x: { accessor: (d) => d.col },
			y: { accessor: (d) => d.row },
			color: { accessor: (d: Row) => d.value }
		},
		resolveColor: (row) => (row.value >= 15 ? 'hot' : 'cold'),
		...overrides
	};
	const ctx = { ...CTX, ...ctxOverrides };
	return buildMarkers(buildTransforms<typeof state>()(state, ctx), ctx).markers ?? [];
}

/** The cells the phase draws, without its value labels. */
function build(...args: Parameters<typeof buildAll>) {
	return buildAll(...args).filter((m) => m.type === 'cell') as CellMarkerConfig[];
}

describe('buildMarkers – style grouping', () => {
	test('one marker per distinct resolved style bucket', () => {
		const markers = build();
		expect(markers).toHaveLength(1);
		expect(markers[0].data).toHaveLength(2);
	});

	test('a segment style split puts cells in separate buckets', () => {
		const markers = build({
			segments: {
				default: [{ areas: [{ x: { from: 'A', to: 'A' } }], styles: { fill: 'red' } }]
			}
		});
		expect(markers).toHaveLength(2);
	});
});

describe('buildMarkers – segment catch-all vs area-specific priority', () => {
	test('an area-specific segment overrides the catch-all regardless of list order', () => {
		const markers = build({
			segments: {
				default: [
					{ styles: { fillOpacity: 0.5 } },
					{ areas: [{ x: { from: 'A', to: 'A' } }], styles: { fill: 'red' } }
				]
			}
		});
		const cellA = markers.find((m) => (m.data as Row[]).some((d) => d.col === 'A'))!;
		expect(cellA.styles?.fillOpacity).toBe(0.5);
		expect((cellA.fill as (d: Row) => string)({ row: 'X', col: 'A', value: 10 })).toBe('red');
	});
});

describe('buildMarkers – legend range dimming', () => {
	test('a cell outside the active range gets the disabled-style override', () => {
		const markers = build(
			{},
			{ range: { min: 0, max: 15, mode: 'filter', disabledStyle: { opacity: 0.2 } } }
		);
		const dimmed = markers.find((m) => (m.data as Row[]).some((d) => d.value === 20))!;
		expect(dimmed.styles?.fillOpacity).toBe(0.2);
	});

	test('a cell inside the active range is untouched', () => {
		const markers = build(
			{},
			{ range: { min: 0, max: 15, mode: 'filter', disabledStyle: { opacity: 0.2 } } }
		);
		const inRange = markers.find((m) => (m.data as Row[]).some((d) => d.value === 10))!;
		expect(inRange.styles?.fillOpacity).toBe(1);
	});
});

describe('buildMarkers – fill', () => {
	test('falls back to resolveColor(row) when the segment sets no literal fill', () => {
		const [marker] = build();
		const fill = marker.fill as (d: Row) => string;
		expect(fill({ row: 'X', col: 'A', value: 10 })).toBe('cold');
		expect(fill({ row: 'Y', col: 'B', value: 20 })).toBe('hot');
	});
});

describe('buildMarkers – value labels', () => {
	const labels = (markers: ReturnType<typeof buildAll>) =>
		markers.filter((m) => m.type === 'text') as TextMarkerConfig[];

	test('every cell is labelled with its own value by default, on top of the cells', () => {
		const markers = buildAll();
		const [label] = labels(markers);
		expect(markers.at(-1)).toBe(label);
		expect(label.data).toHaveLength(FLAT.length);
		const text = label.text as (d: Row) => string;
		expect(label.data!.map((d) => text(d as Row))).toEqual(['10', '20']);
	});

	test('`values.show: false` hides them', () => {
		expect(labels(buildAll({ values: { show: false } }))).toHaveLength(0);
	});

	test('`values.format` formats each value', () => {
		const [label] = labels(buildAll({ values: { format: (v) => `${v}%` } }));
		const text = label.text as (d: Row) => string;
		expect(text(FLAT[0])).toBe('10%');
	});
});
