import { describe, test, expect, vi, afterEach } from 'vitest';
import { SvelteMap } from 'svelte/reactivity';
import { buildData } from '$lib/layout/phases/data';
import { buildMapping } from '$lib/layout/phases/mapping';
import { buildScales } from '$lib/layout/phases/scales';
import { buildTransforms } from '$lib/layout/phases/transforms';
import { buildAxisStages } from '$lib/layout/phases/axisStages';
import { runStages } from '$lib/layout/phases/runStages';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import type { AxisPlotState, AxisPlotCtx } from '$lib/types/layout/phases';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { LegendInteractionStore } from '$lib/types/layout/legend';

type Row = { x: number; y: number; g: string };
type State = AxisPlotState<Row, { fill?: string }>;

const ROWS: Row[] = [
	{ x: 1, y: 2, g: 'B' },
	{ x: 2, y: 4, g: 'B' },
	{ x: 1, y: 3, g: 'A' },
	{ x: 2, y: 5, g: 'A' }
];

const CTX: AxisPlotCtx = { cfg: DEFAULT_CONFIG, legendInteraction: null };

function state(overrides: Partial<State> = {}): State {
	return {
		data: ROWS,
		x: 'x',
		y: 'y',
		color: 'g',
		scales: {},
		width: 400,
		height: 300,
		...overrides
	};
}

const names = (s: State) => s.resolvedSeries!.map((series) => series.name);

describe('buildData', () => {
	test('splits flat rows into one series per grouping value, `color` when `grouping` is unset', () => {
		expect(names(buildData<State, AxisPlotCtx>()(state(), CTX))).toEqual(['B', 'A']);
		const byX = buildData<State, AxisPlotCtx>()(state({ grouping: 'x' }), CTX);
		expect(names(byX)).toEqual(['1', '2']);
	});

	test('a grouping option that groups by nothing keeps the rows one series', () => {
		const out = buildData<State, AxisPlotCtx>({ grouping: () => undefined })(state(), CTX);
		expect(out.resolvedSeries).toHaveLength(1);
		expect(out.flat).toHaveLength(4);
	});

	test('seriesChannels builds each series from other accessors', () => {
		const out = buildData<State, AxisPlotCtx>({ seriesChannels: () => ({ x: 'y', y: 'x' }) })(
			state(),
			CTX
		);
		expect(out.resolvedSeries![0]).toMatchObject({ x: 'y', y: 'x' });
	});

	test('orderSeries reorders the series; colorOrder alone decides which color each takes', () => {
		const sorted = buildData<State, AxisPlotCtx>({
			orderSeries: (series) => [...series].sort((a, b) => a.name.localeCompare(b.name))
		})(state(), CTX);
		expect(names(sorted)).toEqual(['A', 'B']);

		const plain = buildData<State, AxisPlotCtx>()(state(), CTX);
		const recolored = buildData<State, AxisPlotCtx>({
			colorOrder: (series) => [...series].reverse()
		})(state(), CTX);
		expect(recolored.colorForSeries!('A')).toBe(plain.colorForSeries!('B'));
	});

	test('drops a series the legend omits, keeping every color and name in place', () => {
		const legendInteraction = {
			disabledSeries: new SvelteMap([['B', { mode: 'omit' }]])
		} as unknown as LegendInteractionStore;
		const plain = buildData<State, AxisPlotCtx>()(state(), CTX);
		const out = buildData<State, AxisPlotCtx>()(state(), { ...CTX, legendInteraction });
		expect(names(out)).toEqual(['A']);
		expect(out.allSeriesNames).toEqual(['B', 'A']);
		expect(out.colorForSeries!('A')).toBe(plain.colorForSeries!('A'));
	});

	test("scoped groups read a segment's own color through segmentColor", () => {
		const out = buildData<State, AxisPlotCtx>({ segmentColor: (style) => style?.fill })(
			state({ segments: { A: [{ styles: { fill: '#123456' } }] } }),
			CTX
		);
		const a = out.scopedGroups!.find((g) => g.name === 'A')!;
		expect(a.segments[0].color).toBe('#123456');
	});

	test('extend adds the plot kind’s own output after the shared one', () => {
		const out = buildData<State & { count?: number }, AxisPlotCtx>({
			extend: (s) => ({ ...s, count: s.resolvedSeries!.length })
		})(state(), CTX);
		expect(out.count).toBe(2);
	});
});

describe('buildMapping', () => {
	const mapped = (overrides: Partial<State> = {}) =>
		buildMapping<State, AxisPlotCtx>()(buildData<State, AxisPlotCtx>()(state(overrides), CTX), CTX)
			.channels!;

	test('x/y read the first series’ own accessors', () => {
		const channels = mapped();
		expect(channels.x.accessor(ROWS[0])).toBe(1);
		expect(channels.y.accessor(ROWS[0])).toBe(2);
	});

	test('a channel resolves only when its prop is set', () => {
		expect(mapped().opacity).toBeUndefined();
		expect(mapped({ opacity: 'y' }).opacity!.accessor(ROWS[0])).toBe(2);
	});

	test('a size channel given a number stays that literal size', () => {
		expect(mapped({ r: 6 }).r).toBe(6);
		expect(mapped({ length: 'y' }).length).toMatchObject({ accessor: expect.any(Function) });
	});

	test('grouping defaults to `color`, unless the grouping option says otherwise', () => {
		expect(mapped().grouping!.accessor(ROWS[0])).toBe('B');
		const none = buildMapping<State, AxisPlotCtx>({ grouping: () => undefined })(
			buildData<State, AxisPlotCtx>()(state(), CTX),
			CTX
		);
		expect(none.channels!.grouping).toBeUndefined();
	});
});

describe('buildScales', () => {
	const prepared = (overrides: Partial<State> = {}) =>
		buildTransforms<State, AxisPlotCtx>()(
			buildData<State, AxisPlotCtx>()(state(overrides), CTX),
			CTX
		);
	const derived = {
		type: 'line',
		data: [{ a: 10, b: 20 }],
		x: 'a',
		y: 'b'
	} as unknown as AxisBasedMarkersConfig;

	test('with nothing derived and no ranges, every axis is left alone', () => {
		expect(buildScales<State, AxisPlotCtx>()(prepared(), CTX).scales).toEqual({});
	});

	test('grows each numeric axis to cover a derived marker, from zero where asked', () => {
		const out = buildScales<State, AxisPlotCtx>({ zero: ['y'] })(
			{ ...prepared(), markers: [derived] },
			CTX
		);
		expect(out.scales.x?.domain).toEqual([1, 10]);
		expect(out.scales.y?.domain).toEqual([0, 20]);
	});

	test('grows to the ranges a transform gave the rows (a stack’s top)', () => {
		const out = buildScales<State, AxisPlotCtx>()(
			prepared({ transforms: [{ type: 'stackY' }] }),
			CTX
		);
		const [, hi] = out.scales.y?.domain as [number, number];
		expect(hi).toBe(9);
	});

	test('a pinned domain is left alone', () => {
		const out = buildScales<State, AxisPlotCtx>()(
			{ ...prepared({ scales: { y: { domain: [0, 100] } } }), markers: [derived] },
			CTX
		);
		expect(out.scales.y?.domain).toEqual([0, 100]);
	});

	test('override replaces the shared stage', () => {
		const override = (s: State) => ({ ...s, scales: { x: { label: 'own' } } });
		expect(buildScales<State, AxisPlotCtx>({ override })(prepared(), CTX).scales).toEqual({
			x: { label: 'own' }
		});
	});
});

describe('buildAxisStages', () => {
	afterEach(() => vi.restoreAllMocks());

	test('every phase, in order, the kind’s own markers last', () => {
		const markers = (s: State) => s;
		const stages = buildAxisStages<State, AxisPlotCtx>({ markers });
		expect(stages.map((s) => s.phase)).toEqual([
			'data',
			'mapping',
			'transforms',
			'statistics',
			'scales',
			'markers'
		]);
		expect(stages.at(-1)!.run).toBe(markers);
	});

	test('runStages warns when stages are declared out of phase order', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const pass = (s: unknown) => s;
		runStages(
			[
				{ phase: 'markers', run: pass },
				{ phase: 'scales', run: pass }
			],
			{},
			{}
		);
		expect(warn).toHaveBeenCalledOnce();
	});
});
