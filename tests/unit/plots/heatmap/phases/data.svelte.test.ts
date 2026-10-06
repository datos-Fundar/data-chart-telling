import { describe, test, expect } from 'vitest';
import { stageOf } from '../../_helpers/stages';
import { buildHeatmapKind } from '$lib/plots/heatmap/kind';
import type { HeatmapPlotState } from '$lib/types/plots/heatmap/state';
import type { Series } from '$lib/types/plots/data/common';

const buildData = stageOf(buildHeatmapKind<Row>(), 'data');

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { row: string; col: string; value: number };

function series(name: string, data: Row[]): Series<Row> {
	return { name, x: 'col', y: 'row', color: 'value', data };
}

function build(overrides: Partial<HeatmapPlotState<Row>> = {}) {
	const state: HeatmapPlotState<Row> = {
		segments: {},
		scales: {},
		width: 400,
		height: 300,
		series: [series('a', [{ row: 'X', col: 'A', value: 1 }])],
		...overrides
	};
	return buildData(state);
}

describe('buildData – series resolution', () => {
	test('passes through an explicit series array', () => {
		const result = build({ series: [series('a', [{ row: 'X', col: 'A', value: 1 }])] });
		expect(result.resolvedSeries).toHaveLength(1);
	});

	test('builds a single series from flat data/x/y when series is not given', () => {
		const data: Row[] = [
			{ row: 'X', col: 'A', value: 1 },
			{ row: 'Y', col: 'B', value: 2 }
		];
		const state: HeatmapPlotState<Row> = {
			data,
			x: 'col',
			y: 'row',
			segments: {},
			scales: {},
			width: 400,
			height: 300
		};
		const result = buildData(state);
		expect(result.resolvedSeries).toHaveLength(1);
		expect(result.resolvedSeries![0].data).toEqual(data);
	});

	test('flattens every resolved series own rows', () => {
		const result = build({
			series: [series('a', [{ row: 'X', col: 'A', value: 1 }])]
		});
		expect(result.flat).toEqual([{ row: 'X', col: 'A', value: 1 }]);
	});
});
