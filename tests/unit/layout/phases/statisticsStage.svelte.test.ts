import { describe, test, expect } from 'vitest';
import { buildStatistics } from '$lib/layout/phases/statistics';
import type { StatisticsStageState } from '$lib/types/layout/phases';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

type Row = { x: number; y: number; g: string };

const rows: Row[] = [
	{ x: 1, y: 2, g: 'A' },
	{ x: 2, y: 4, g: 'A' },
	{ x: 3, y: 3, g: 'B' }
];

const series = [
	{ name: 'A', x: 'x', y: 'y', data: rows.slice(0, 2) },
	{ name: 'B', x: 'x', y: 'y', data: rows.slice(2) }
];

function state(overrides: Partial<StatisticsStageState> = {}): StatisticsStageState {
	return {
		resolvedSeries: series as never,
		flat: rows,
		colorForSeries: (name) => (name === 'A' ? '#aa0000' : '#0000bb'),
		...overrides
	};
}

const MOVING_AVERAGE = { type: 'movingAverage' as const, k: 2 };
const types = (markers?: AxisBasedMarkersConfig[]) => markers?.map((m) => m.type);

describe('buildStatistics', () => {
	test('puts the plot-level statistics before the author markers', () => {
		const rule = { type: 'rule', y: 3 } as unknown as AxisBasedMarkersConfig;
		const out = buildStatistics()(state({ statistics: [MOVING_AVERAGE], authorMarkers: [rule] }));
		expect(types(out.markers)).toEqual(['line', 'line', 'rule']);
	});

	test("expands an author marker's own statistics right after it", () => {
		const dot = {
			type: 'dot',
			data: rows,
			x: 'x',
			y: 'y',
			statistics: [MOVING_AVERAGE]
		} as unknown as AxisBasedMarkersConfig;
		const out = buildStatistics()(state({ authorMarkers: [dot] }));
		expect(types(out.markers)).toEqual(['dot', 'line']);
	});

	test('an unscoped author marker takes the first series color', () => {
		const line = { type: 'line', data: rows, x: 'x', y: 'y' } as unknown as AxisBasedMarkersConfig;
		const out = buildStatistics()(state({ authorMarkers: [line] }));
		expect((out.markers![0] as { styles?: { stroke?: string } }).styles?.stroke).toBe('#aa0000');
	});

	test('defaultColor overrides the first series color', () => {
		const line = { type: 'line', data: rows, x: 'x', y: 'y' } as unknown as AxisBasedMarkersConfig;
		const out = buildStatistics<StatisticsStageState>({ defaultColor: () => '#123456' })(
			state({ authorMarkers: [line] })
		);
		expect((out.markers![0] as { styles?: { stroke?: string } }).styles?.stroke).toBe('#123456');
	});

	test('inheritGrouping: false leaves a value-channel `color` out of the markers', () => {
		const dot = { type: 'dot', data: rows, x: 'x', y: 'y' } as unknown as AxisBasedMarkersConfig;
		const grouped = buildStatistics()(state({ color: 'g', authorMarkers: [dot] }));
		const plain = buildStatistics({ inheritGrouping: false })(
			state({ color: 'g', authorMarkers: [dot] })
		);
		expect((grouped.markers![0] as { color?: unknown }).color).toBe('g');
		expect((plain.markers![0] as { color?: unknown }).color).toBeUndefined();
	});

	test('inheritPositions gives a line/area/dot marker the plot x/y, and only those kinds', () => {
		const line = { type: 'line', data: rows } as unknown as AxisBasedMarkersConfig;
		const rule = { type: 'rule', y: 3 } as unknown as AxisBasedMarkersConfig;
		const out = buildStatistics({ inheritPositions: true })(state({ authorMarkers: [line, rule] }));
		expect(out.markers![0]).toMatchObject({ x: 'x', y: 'y' });
		expect(out.markers![1]).not.toHaveProperty('x');
	});

	test('no statistics and no author markers leaves an empty list', () => {
		expect(buildStatistics()(state()).markers).toEqual([]);
	});
});
