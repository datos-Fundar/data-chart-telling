import { describe, test, expect } from 'vitest';
import { buildBarDefaults } from '$lib/plots/ranking/bar/defaults';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { stageOf } from '../../../_helpers/stages';

const buildTransforms = stageOf(buildBarDefaults<Row>(), 'transforms');
const buildScales = stageOf(buildBarDefaults<Row>(), 'scales');
const VERTICAL = new PlotAxes({
	category: 'x',
	value: 'y',
	orientation: 'vertical',
	bands: ['x']
});
const HORIZONTAL = new PlotAxes({
	category: 'y',
	value: 'x',
	orientation: 'horizontal',
	bands: ['y']
});
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/ranking/bar/state';
import type { Series } from '$lib/types/plots/data/common';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { category: string; value: number };

const PADDING = { inner: 0.2, outer: 0.1 };
const CTX: BarPlotCtx = {
	cfg: {
		bar: { paddingInner: PADDING.inner, paddingOuter: PADDING.outer, seriesPadding: 0.1 },
		margins: { top: 20, right: 20, bottom: 30, left: 40 }
	} as PlotStylesConfig
};

function series(data: Row[], name = 'a'): Series<Row> {
	return { name, x: 'category', y: 'value', data };
}

const ROWS = [
	{ category: 'A', value: 10 },
	{ category: 'B', value: -5 }
];
const GROUPED_SERIES: Series<Row>[] = [series(ROWS)];

// The scales phase reads data/mapping-phase output these tests don't otherwise
// care about - filled with defaults consistent with `GROUPED_SERIES`.
function build(overrides: Partial<BarPlotState<Row>> = {}) {
	const state: BarPlotState<Row> = {
		segments: {},
		gaps: {},
		scales: {},
		resolvedSeries: GROUPED_SERIES,
		axes: VERTICAL,
		width: 400,
		height: 300,
		flat: ROWS,
		channels: {
			x: { accessor: (d) => d.category },
			y: { accessor: (d) => d.value }
		},
		groupedSeries: [{ series: GROUPED_SERIES[0], visualSegments: [{ data: ROWS, styles: {} }] }],
		gapFillMaps: new Map(),
		...overrides
	};
	return buildScales(buildTransforms(state, CTX), CTX).scales;
}

// ── Categorical sentinel ──────────────────────────────────────────────────────

describe('buildScales - categorical sentinel', () => {
	test('resolves the categorical sentinel to a band scale', () => {
		const result = build({ scales: { x: { type: 'categorical' } } });
		expect(result.x?.type).toBe('band');
	});

	test('the category axis is a band scale even when unmarked', () => {
		expect(build().x?.type).toBe('band');
	});
});

// ── Category axis padding ────────────────────────────────────────────────────

describe('buildScales - category axis padding', () => {
	test('backs paddingInner/paddingOuter with the given defaults when unset', () => {
		const result = build();
		expect(result.x?.paddingInner).toBe(PADDING.inner);
		expect(result.x?.paddingOuter).toBe(PADDING.outer);
	});

	test('an explicit padding shorthand wins over the defaults for both sides', () => {
		const result = build({ scales: { x: { padding: 0.4 } } });
		expect(result.x?.paddingInner).toBe(0.4);
		expect(result.x?.paddingOuter).toBe(0.4);
	});

	test('explicit paddingInner/paddingOuter win over both the shorthand and the defaults', () => {
		const result = build({
			scales: { x: { padding: 0.4, paddingInner: 0.05, paddingOuter: 0.15 } }
		});
		expect(result.x?.paddingInner).toBe(0.05);
		expect(result.x?.paddingOuter).toBe(0.15);
	});

	test('applies padding to y instead when it is the categorical axis', () => {
		const result = build({ axes: HORIZONTAL });
		expect(result.y?.paddingInner).toBe(PADDING.inner);
		expect(result.x?.paddingInner).toBeUndefined();
	});
});

// ── Value axis domain ─────────────────────────────────────────────────────────

describe('buildScales - value axis domain', () => {
	test('nice-widens the value axis from the raw per-row min/max', () => {
		const result = build();
		const [lo, hi] = result.y!.domain as [number, number];
		expect(lo).toBeLessThanOrEqual(-5);
		expect(hi).toBeGreaterThanOrEqual(10);
	});

	test('leaves an explicit domain untouched', () => {
		const result = build({ scales: { y: { domain: [0, 100] } } });
		expect(result.y?.domain).toEqual([0, 100]);
	});

	test('leaves the domain untouched when ticks or nice are set', () => {
		expect(build({ scales: { y: { ticks: [0, 50, 100] } } }).y?.domain).toBeUndefined();
		expect(build({ scales: { y: { nice: false } } }).y?.domain).toBeUndefined();
	});

	test('a plot-level stackY widens the domain from per-category totals, not raw per-row values', () => {
		const stackedSeries: Series<Row>[] = [
			series([{ category: 'A', value: 40 }], 'a'),
			series([{ category: 'A', value: 40 }], 'b')
		];
		const groups = stackedSeries.map((s) => ({
			series: s,
			visualSegments: [{ data: s.data, styles: {} }]
		}));
		const grouped = build({ resolvedSeries: stackedSeries, groupedSeries: groups });
		const stacked = build({
			resolvedSeries: stackedSeries,
			groupedSeries: groups,
			transforms: [{ type: 'stackY' }]
		});
		const [, groupedHi] = grouped.y!.domain as [number, number];
		const [, stackedHi] = stacked.y!.domain as [number, number];
		// Side by side only ever sees a single row's own value (40); stacked
		// sees the summed category total (80).
		expect(groupedHi).toBeLessThan(stackedHi);
		expect(stackedHi).toBeGreaterThanOrEqual(80);
	});

	test('no series data leaves the value axis without a computed domain', () => {
		expect(build({ resolvedSeries: [] }).y?.domain).toBeUndefined();
	});
});
