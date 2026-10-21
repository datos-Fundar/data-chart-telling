import { describe, test, expect } from 'vitest';
import { stageOf } from '../../../_helpers/stages';
import { buildHeatmapDefaults } from '$lib/plots/correlation/heatmap/defaults';
import type { HeatmapPlotState } from '$lib/types/plots/correlation/heatmap/state';
import type { Series } from '$lib/types/plots/data/common';

const buildMapping = stageOf(buildHeatmapDefaults<Row>(), 'mapping');

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { row: string; col: string; value: number };

const SERIES: Series<Row>[] = [
	{ name: 'a', x: 'col', y: 'row', color: 'value', data: [{ row: 'X', col: 'A', value: 5 }] }
];

function build(overrides: Partial<HeatmapPlotState<Row>> = {}) {
	const state: HeatmapPlotState<Row> = {
		segments: {},
		scales: {},
		width: 400,
		height: 300,
		resolvedSeries: SERIES,
		...overrides
	};
	return buildMapping(state);
}

describe('buildMapping - channels', () => {
	test('resolves x/y/color to the first series own accessors', () => {
		const result = build();
		const row = SERIES[0].data[0];
		expect(result.channels!.x.accessor(row)).toBe('A');
		expect(result.channels!.y.accessor(row)).toBe('X');
		expect(result.channels!.color.accessor(row)).toBe(5);
	});

	test('falls back to the top-level x/y/color props when resolvedSeries is empty', () => {
		const result = build({
			resolvedSeries: [],
			x: (d) => d.col,
			y: (d) => d.row,
			color: (d) => d.value
		});
		const row: Row = { row: 'Y', col: 'B', value: 9 };
		expect(result.channels!.x.accessor(row)).toBe('B');
		expect(result.channels!.y.accessor(row)).toBe('Y');
		expect(result.channels!.color.accessor(row)).toBe(9);
	});
});
