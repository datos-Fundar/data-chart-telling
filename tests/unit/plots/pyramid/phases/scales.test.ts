import { describe, test, expect } from 'vitest';
import { buildScales } from '$lib/plots/pyramid/phases/scales';
import type {
	PyramidPlotState,
	PyramidPlotCtx,
	PyramidSeries
} from '$lib/types/plots/pyramid/state';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { ageGroup: string; pct: number | null };

const CTX: PyramidPlotCtx = {
	cfg: { palette: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'] } as PlotStylesConfig,
	formatValue: (v) => `${v}%`,
	legendInteraction: null
};

function series(name: string, side: 'left' | 'right', data: Row[]): PyramidSeries<Row> {
	return { name, x: 'ageGroup', y: 'pct', data, side };
}

function build(overrides: Partial<PyramidPlotState<Row>> = {}) {
	const resolvedSeries = overrides.resolvedSeries ?? [
		series('Female', 'left', [
			{ ageGroup: '0-4', pct: 10 },
			{ ageGroup: '5-9', pct: 8 }
		]),
		series('Male', 'right', [
			{ ageGroup: '0-4', pct: 12 },
			{ ageGroup: '5-9', pct: 9 }
		])
	];
	const state: PyramidPlotState<Row> = {
		segments: {},
		gaps: {},
		scales: {},
		width: 400,
		height: 300,
		resolvedSeries,
		gapFillMaps: new Map(),
		...overrides
	};
	return buildScales(state, CTX).scales;
}

describe('buildScales - x (diverging magnitude) domain', () => {
	test('spans [-maxMagnitude, maxMagnitude] over every series', () => {
		const result = build();
		expect(result.x?.domain).toEqual([-12, 12]);
	});

	test('a gap-filled row contributes its filled value instead of being skipped', () => {
		const female = series('Female', 'left', [{ ageGroup: '0-4', pct: null }]);
		const result = build({
			resolvedSeries: [female],
			gapFillMaps: new Map([
				['Female', new Map([[female.data[0], { value: 40, kind: 'middle' as const, styles: {} }]])]
			])
		});
		expect(result.x?.domain).toEqual([-40, 40]);
	});

	test('defaults to [-1, 1] when there is no real or filled data', () => {
		const result = build({ resolvedSeries: [series('Female', 'left', [])] });
		expect(result.x?.domain).toEqual([-1, 1]);
	});

	test('an explicit scales.x config wins over the computed domain', () => {
		const result = build({ scales: { x: { domain: [-100, 100] } } });
		expect(result.x?.domain).toEqual([-100, 100]);
	});
});

describe('buildScales - y (category) domain', () => {
	test('is a band scale over every distinct category, in first-seen order', () => {
		const result = build();
		expect(result.y?.type).toBe('band');
		expect(result.y?.domain).toEqual(['0-4', '5-9']);
	});
});
