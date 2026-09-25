import { describe, test, expect } from 'vitest';
import { buildMapping } from '$lib/plots/pyramid/phases/mapping';
import type {
	PyramidPlotState,
	PyramidPlotCtx,
	PyramidSeries
} from '$lib/types/plots/pyramid/state';
import type { ChartConfig } from '$lib/types/configuration/styling';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { ageGroup: string; pct: number | null };

const CTX: PyramidPlotCtx = {
	cfg: { palette: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'] } as ChartConfig,
	formatValue: (v, name) => `${name}:${v}`
};

function series(name: string, side: 'left' | 'right', data: Row[]): PyramidSeries<Row> {
	return { name, x: 'ageGroup', y: 'pct', data, side };
}

function build(resolvedSeries: PyramidSeries<Row>[]) {
	const state: PyramidPlotState<Row> = {
		segments: {},
		gaps: {},
		scales: {},
		width: 400,
		height: 300,
		resolvedSeries
	};
	return buildMapping(state, CTX).flat!;
}

describe('buildMapping – tagged rows', () => {
	test('signs the magnitude negative for left, positive for right', () => {
		const flat = build([
			series('Female', 'left', [{ ageGroup: '0-4', pct: 10 }]),
			series('Male', 'right', [{ ageGroup: '0-4', pct: 12 }])
		]);
		expect(flat.find((d) => d.__series === 'Female')!.__x).toBe(-10);
		expect(flat.find((d) => d.__series === 'Male')!.__x).toBe(12);
	});

	test('reads the category from Series.x', () => {
		const flat = build([series('Female', 'left', [{ ageGroup: '5-9', pct: 10 }])]);
		expect(flat[0].__y).toBe('5-9');
	});

	test('formats the label via ctx.formatValue, keyed by the absolute value', () => {
		const flat = build([series('Female', 'left', [{ ageGroup: '0-4', pct: 10 }])]);
		expect(flat[0].__label).toBe('Female:10');
	});

	test('drops rows with a gap (null/undefined) magnitude', () => {
		const flat = build([
			series('Female', 'left', [
				{ ageGroup: '0-4', pct: 10 },
				{ ageGroup: '5-9', pct: null }
			])
		]);
		expect(flat).toHaveLength(1);
		expect(flat[0].ageGroup).toBe('0-4');
	});
});
