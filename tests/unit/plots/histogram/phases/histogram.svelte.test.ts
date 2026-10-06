import { describe, test, expect } from 'vitest';
import { mergeBin, defaultBin } from '$lib/plots/histogram/phases/transforms';
import { buildHistogramKind } from '$lib/plots/histogram/kind';
import { stageOf } from '../../_helpers/stages';
import { buildMarkers } from '$lib/plots/histogram/phases/markers';
import {
	DEFAULT_CONFIG,
	setConfiguration,
	resetConfiguration
} from '$lib/configuration/config.svelte';
import { SERIES_KEY } from '$lib/layout/phases/transforms';
import type { HistogramPlotState, HistogramPlotCtx } from '$lib/types/plots/histogram/state';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

type Row = Record<string, unknown>;

const buildData = stageOf(buildHistogramKind<Row>(), 'data');
const buildTransforms = stageOf(buildHistogramKind<Row>(), 'transforms');
const buildScales = stageOf(buildHistogramKind<Row>(), 'scales');
type Rect = {
	type: 'rect';
	series: string;
	data: Row[];
	y1: number;
	y2: string;
	styles: { fillOpacity: number };
};

const CTX = { cfg: DEFAULT_CONFIG, legendInteraction: null } as HistogramPlotCtx;

const rows: Row[] = [
	{ v: 1, g: 'A' },
	{ v: 4, g: 'B' },
	{ v: 12, g: 'A' },
	{ v: 15, g: 'A' },
	{ v: 18, g: 'B' }
];

/** A state as the "data" phase leaves it for a flat plot grouped by `g`. */
function flatState(overrides: Partial<HistogramPlotState<Row>> = {}): HistogramPlotState<Row> {
	return {
		data: rows,
		x: 'v',
		grouping: 'g',
		scales: {},
		width: 400,
		height: 300,
		transforms: [],
		authorMarkers: [],
		resolvedSeries: [
			{ name: 'A', x: 'v', y: 'v', data: rows.filter((r) => r.g === 'A') },
			{ name: 'B', x: 'v', y: 'v', data: rows.filter((r) => r.g === 'B') }
		],
		colorForSeries: (name: string) => (name === 'A' ? '#111' : '#222'),
		flat: rows,
		...overrides
	};
}

/** Runs "transforms" → "scales" → "markers", the phases after "data". */
function run(state: HistogramPlotState<Row>, ctx: HistogramPlotCtx = CTX) {
	return buildMarkers(buildScales(buildTransforms(state, ctx)), ctx);
}

const rects = (state: HistogramPlotState<Row>) =>
	(state.markers ?? []).filter((m) => m.type === 'rect') as unknown as Rect[];

describe('mergeBin', () => {
	test('with no transforms of its own, a histogram runs the default count bin', () => {
		expect(mergeBin([], DEFAULT_CONFIG)).toEqual([defaultBin(DEFAULT_CONFIG)]);
	});

	test('the plot’s own binX merges over the default one, its props winning', () => {
		const [bin] = mergeBin([{ type: 'binX', thresholds: [0, 10, 20] }], DEFAULT_CONFIG);
		expect(bin).toMatchObject({ type: 'binX', y: 'count', thresholds: [0, 10, 20] });
	});

	test('a plot’s own binX can override the default count', () => {
		const [bin] = mergeBin([{ type: 'binX', y: 'sum' }], DEFAULT_CONFIG);
		expect(bin).toMatchObject({ type: 'binX', y: 'sum' });
	});

	test('other transforms stay after the bin, in order', () => {
		const out = mergeBin([{ type: 'stackY' }, { type: 'binX', interval: 5 }], DEFAULT_CONFIG);
		expect(out.map((t) => t.type)).toEqual(['binX', 'stackY']);
	});

	test('the default bin’s inset comes from the configuration, on both sides', () => {
		const [bin] = mergeBin([], { ...DEFAULT_CONFIG, histogram: { inset: 3, fillOpacity: 1 } });
		expect(bin).toMatchObject({ insetLeft: 3, insetRight: 3 });
	});
});

describe('buildTransforms', () => {
	test('bins every series in one pass, each bin keeping its series', () => {
		const state = buildTransforms(
			flatState({ transforms: [{ type: 'binX', thresholds: [0, 10, 20] }] }),
			CTX
		);
		const series = state.processedData!.data.map((r) => r[SERIES_KEY]).sort();
		// A: [0,10) and [10,20); B: [0,10) and [10,20)
		expect(series).toEqual(['A', 'A', 'B', 'B']);
	});
});

describe('buildMarkers', () => {
	test('each series gets its own scoped rect', () => {
		expect(rects(run(flatState())).map((r) => r.series)).toEqual(['A', 'B']);
	});

	test('each bar goes from zero up to its count', () => {
		const [bar] = rects(run(flatState()));
		expect(bar.y1).toBe(0);
		expect(bar.y2).toBe('__y');
	});

	test('the markers the statistics phase left come after the default bins', () => {
		const rule = { type: 'rule', y: 3 } as unknown as AxisBasedMarkersConfig;
		const state = run(flatState({ markers: [rule] }));
		expect(state.markers!.at(-1)).toBe(rule);
		expect(state.markers!.length).toBe(rects(state).length + 1);
	});
});

describe('buildScales', () => {
	test("the bins' edges set x; y, a plain count, is left to svelteplot's own bars", () => {
		const state = buildScales(
			buildTransforms(flatState({ transforms: [{ type: 'binX', thresholds: [0, 10, 20] }] }), CTX)
		);
		const [xLo, xHi] = state.scales.x?.domain as [number, number];
		expect(xLo).toBeLessThanOrEqual(1);
		expect(xHi).toBeGreaterThanOrEqual(18);
		expect(state.scales.y?.domain).toBeUndefined();
	});

	test('a marker with its own rows grows the axes to cover it, y still from zero', () => {
		const rule = {
			type: 'line',
			data: [
				{ a: 30, b: 4 },
				{ a: 40, b: 6 }
			],
			x: 'a',
			y: 'b'
		} as unknown as AxisBasedMarkersConfig;
		const state = buildScales(buildTransforms(flatState({ markers: [rule] }), CTX));
		const [xLo, xHi] = state.scales.x?.domain as [number, number];
		const [yLo, yHi] = state.scales.y?.domain as [number, number];
		expect(xLo).toBeLessThanOrEqual(1);
		expect(xHi).toBeGreaterThanOrEqual(40);
		expect(yLo).toBe(0);
		expect(yHi).toBeGreaterThanOrEqual(6);
	});

	test('a pinned domain is left alone', () => {
		const line = {
			type: 'line',
			data: [{ a: 1, b: 50 }],
			x: 'a',
			y: 'b'
		} as unknown as AxisBasedMarkersConfig;
		const state = buildScales(
			buildTransforms(flatState({ markers: [line], scales: { y: { domain: [0, 10] } } }), CTX)
		);
		expect(state.scales.y?.domain).toEqual([0, 10]);
	});
});

describe('histogram bars from the configuration', () => {
	test('bars take the configured fill opacity, and the default is opaque', () => {
		expect(rects(run(flatState()))[0].styles.fillOpacity).toBe(1);
	});

	test('a configured fill opacity reaches the bars', () => {
		setConfiguration({ histogram: { fillOpacity: 0.4 } });
		try {
			const cfg = { ...DEFAULT_CONFIG, histogram: { inset: 1, fillOpacity: 0.4 } };
			const [bar] = rects(run(flatState(), { cfg, legendInteraction: null }));
			expect(bar.styles.fillOpacity).toBe(0.4);
		} finally {
			resetConfiguration();
		}
	});
});

describe('histogram segments', () => {
	const input = (overrides: Partial<HistogramPlotState<Row>> = {}): HistogramPlotState<Row> => ({
		data: rows,
		x: 'v',
		grouping: 'g',
		scales: {},
		width: 400,
		height: 300,
		...overrides
	});

	test('a segment’s fillOpacity styles the bars of every series it covers', () => {
		const state = run(
			buildData(input({ segments: { default: [{ styles: { fillOpacity: 0.4 } }] } }), CTX)
		);
		const bars = rects(state);
		expect(bars.map((b) => b.series).sort()).toEqual(['A', 'B']);
		expect(bars.every((b) => b.styles.fillOpacity === 0.4)).toBe(true);
	});

	test('without segments, bars keep the configured opacity', () => {
		const bars = rects(run(buildData(input(), CTX)));
		expect(bars).toHaveLength(2);
		expect(bars.every((b) => b.styles.fillOpacity === 1)).toBe(true);
	});
});
