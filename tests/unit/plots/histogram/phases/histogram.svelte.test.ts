import { describe, test, expect } from 'vitest';
import { buildTransforms, buildMarkers, defaultBin } from '$lib/plots/histogram/phases/markers';
import {
	DEFAULT_CONFIG,
	setConfiguration,
	resetConfiguration
} from '$lib/configuration/config.svelte';
import { buildScales } from '$lib/plots/histogram/phases/scales';
import { buildData } from '$lib/plots/histogram/phases/data';
import type { HistogramPlotState } from '$lib/types/plots/histogram/state';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

type Row = Record<string, unknown>;

const CTX = { cfg: DEFAULT_CONFIG } as never;

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

describe('buildTransforms', () => {
	test('with no transforms of its own, a histogram runs the default count bin', () => {
		expect(buildTransforms([], DEFAULT_CONFIG)).toEqual([defaultBin(DEFAULT_CONFIG)]);
	});

	test('the plot’s own binX merges over the default one, its props winning', () => {
		const [bin] = buildTransforms([{ type: 'binX', thresholds: [0, 10, 20] }], DEFAULT_CONFIG);
		expect(bin).toMatchObject({ type: 'binX', y: 'count', thresholds: [0, 10, 20] });
	});

	test('a plot’s own binX can override the default count', () => {
		const [bin] = buildTransforms([{ type: 'binX', y: 'sum' }], DEFAULT_CONFIG);
		expect(bin).toMatchObject({ type: 'binX', y: 'sum' });
	});

	test('other transforms stay after the bin, in order', () => {
		const out = buildTransforms(
			[{ type: 'stackY' }, { type: 'binX', interval: 5 }],
			DEFAULT_CONFIG
		);
		expect(out.map((t) => t.type)).toEqual(['binX', 'stackY']);
	});

	test('the default bin’s inset comes from the configuration, on both sides', () => {
		const [bin] = buildTransforms([], {
			...DEFAULT_CONFIG,
			histogram: { inset: 3, fillOpacity: 1 }
		});
		expect(bin).toMatchObject({ insetLeft: 3, insetRight: 3 });
	});
});

describe('buildMarkers', () => {
	test('a series-based histogram bins each series on its own rect marker', () => {
		const state = buildMarkers(
			flatState({
				series: [{ name: 'A', x: 'v', y: 'v', data: rows }] as never,
				resolvedSeries: [{ name: 'A', x: 'v', y: 'v', data: rows }]
			}),
			CTX
		);
		expect(state.binMarkers).toHaveLength(1);
		expect(state.binMarkers![0]).toMatchObject({ type: 'rect', series: 'A' });
	});

	test('flat data gets one unscoped rect that bins per group', () => {
		const state = buildMarkers(flatState(), CTX);
		expect(state.binMarkers).toHaveLength(1);
		const bar = state.binMarkers![0] as AxisBasedMarkersConfig & { series?: string; data: Row[] };
		expect(bar.series).toBeUndefined();
		// two groups, two bins with rows: the bin rows come from both groups
		expect(bar.data.length).toBeGreaterThan(2);
	});

	test('each bar goes from zero up to its count', () => {
		const state = buildMarkers(flatState(), CTX);
		const bar = state.binMarkers![0] as unknown as { y1: number; y2: string };
		expect(bar.y1).toBe(0);
		expect(bar.y2).toBe('__y');
	});

	test('the author’s markers come after the default bins', () => {
		const rule = { type: 'rule', y: 3 } as unknown as AxisBasedMarkersConfig;
		const state = buildMarkers(flatState({ authorMarkers: [rule] }), CTX);
		expect(state.markers!.at(-1)).toBe(rule);
		expect(state.markers!.length).toBe(state.binMarkers!.length + 1);
	});
});

describe('buildScales', () => {
	test('an unpinned y runs from zero up to the tallest bin', () => {
		// with explicit thresholds [0,10) and [10,20), each group's tallest bin holds two rows
		const withMarkers = buildMarkers(
			flatState({ transforms: [{ type: 'binX', thresholds: [0, 10, 20] }] }),
			CTX
		);
		const state = buildScales({ ...withMarkers, scales: {} } as HistogramPlotState<Row>);
		expect(state.scales.y?.domain).toEqual([0, 2]);
	});

	test('an unpinned x covers every bin edge, not just the raw values', () => {
		const withMarkers = buildMarkers(flatState({ transforms: [] }), CTX);
		const state = buildScales({ ...withMarkers, scales: {} } as HistogramPlotState<Row>);
		const [lo, hi] = state.scales.x?.domain as [number, number];
		expect(lo).toBeLessThanOrEqual(1);
		expect(hi).toBeGreaterThanOrEqual(18);
	});

	test('a pinned domain is left alone', () => {
		const withMarkers = buildMarkers(flatState(), CTX);
		const state = buildScales({
			...withMarkers,
			scales: { y: { domain: [0, 10] } }
		} as HistogramPlotState<Row>);
		expect(state.scales.y?.domain).toEqual([0, 10]);
	});
});

describe('histogram bars from the configuration', () => {
	test('bars take the configured fill opacity, and the default is opaque', () => {
		const bar = buildMarkers(flatState(), CTX).binMarkers![0] as unknown as {
			styles: { fillOpacity: number };
		};
		expect(bar.styles.fillOpacity).toBe(1);
	});

	test('a configured fill opacity reaches the bars', () => {
		setConfiguration({ histogram: { fillOpacity: 0.4 } });
		try {
			const cfg = { ...DEFAULT_CONFIG, histogram: { inset: 1, fillOpacity: 0.4 } };
			const bar = buildMarkers(flatState(), { cfg } as never).binMarkers![0] as unknown as {
				styles: { fillOpacity: number };
			};
			expect(bar.styles.fillOpacity).toBe(0.4);
		} finally {
			resetConfiguration();
		}
	});
});

describe('histogram segments', () => {
	test('a segment’s fillOpacity styles the bars of every series it covers', () => {
		const data = buildData(
			{
				data: rows,
				x: 'v',
				grouping: 'g',
				scales: {},
				transforms: [],
				authorMarkers: [],
				segments: { default: [{ styles: { fillOpacity: 0.4 } }] }
			},
			CTX
		);
		const state = buildMarkers(data, CTX);
		const bars = state.binMarkers as unknown as {
			series: string;
			styles: { fillOpacity: number };
		}[];
		expect(bars.map((b) => b.series).sort()).toEqual(['A', 'B']);
		expect(bars.every((b) => b.styles.fillOpacity === 0.4)).toBe(true);
	});

	test('without segments, bars keep the configured opacity', () => {
		const data = buildData(
			{ data: rows, x: 'v', grouping: 'g', scales: {}, transforms: [], authorMarkers: [] },
			CTX
		);
		const bars = buildMarkers(data, CTX).binMarkers as unknown as {
			styles: { fillOpacity: number };
		}[];
		expect(bars).toHaveLength(1);
		expect(bars[0].styles.fillOpacity).toBe(1);
	});
});
