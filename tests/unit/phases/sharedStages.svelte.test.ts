import { describe, test, expect, vi, afterEach } from 'vitest';
import { DataPhase } from '$lib/phases/data/DataPhase';
import { MappingPhase } from '$lib/phases/mapping/MappingPhase';
import { ScalesPhase } from '$lib/phases/scales/ScalesPhase';
import { SERIES_ID_KEY, SERIES_KEY, TransformsPhase } from '$lib/phases/transforms/TransformsPhase';
import { Pipeline } from '$lib/phases/Pipeline';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import type { AxisPlotState, AxisPlotEnv } from '$lib/types/phases';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { runStages } from '../plots/_helpers/stages';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';

type Row = { x: number; y: number; g: string };
type State = AxisPlotState<Row, { fill?: string }>;

const ROWS: Row[] = [
	{ x: 1, y: 2, g: 'B' },
	{ x: 2, y: 4, g: 'B' },
	{ x: 1, y: 3, g: 'A' },
	{ x: 2, y: 5, g: 'A' }
];

const ENV: AxisPlotEnv = { cfg: DEFAULT_CONFIG };

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

describe('DataPhase', () => {
	test('splits flat rows into one series per grouping value, `color` when `grouping` is unset', () => {
		expect(names(new DataPhase<State, AxisPlotEnv>().run(state(), ENV))).toEqual(['B', 'A']);
		const byX = new DataPhase<State, AxisPlotEnv>().run(state({ grouping: 'x' }), ENV);
		expect(names(byX)).toEqual(['1', '2']);
	});

	test('a numeric `color` is a continuous value, not a grouping key: the rows stay one series', () => {
		const out = new DataPhase<State, AxisPlotEnv>().run(state({ color: 'y' }), ENV);
		expect(out.resolvedSeries).toHaveLength(1);
		expect(out.flat).toHaveLength(4);
	});

	test('a position channel the author leaves out stays unset on every series', () => {
		const out = new DataPhase<State, AxisPlotEnv>().run(state({ y: undefined }), ENV);
		expect(out.resolvedSeries![0].x).toBe('x');
		expect('y' in out.resolvedSeries![0]).toBe(false);
		expect(out.axes!.y).toBeUndefined();
	});

	test('reads each axis off its values, and the kind’s category count decides the rest', () => {
		const line = new DataPhase<State, AxisPlotEnv>().run(state(), ENV).axes!;
		expect(line).toMatchObject({ x: { kind: 'continuous' }, value: 'y', orientation: 'vertical' });

		const bars = new DataPhase<State, AxisPlotEnv>({ discreteAxes: 1 }).run(
			state({ x: 'g', color: undefined }),
			ENV
		).axes!;
		expect(bars).toMatchObject({ category: 'x', value: 'y', orientation: 'vertical' });

		const horizontal = new DataPhase<State, AxisPlotEnv>({ discreteAxes: 1 }).run(
			state({ x: 'y', y: 'g', color: undefined }),
			ENV
		).axes!;
		expect(horizontal).toMatchObject({ category: 'y', value: 'x', orientation: 'horizontal' });
	});

	test('a discrete mark fills its gaps along its value axis; a continuous one leaves them', () => {
		const rows = [
			{ x: 1, y: 2, g: 'A' },
			{ x: 2, y: null as unknown as number, g: 'A' },
			{ x: 3, y: 6, g: 'A' }
		];
		const gaps = { default: { middle: {} } };
		const discrete = new DataPhase<State, AxisPlotEnv>({ segments: { connect: false } }).run(
			state({ data: rows, gaps }),
			ENV
		);
		expect(discrete.gapFillMaps!.get('A')!.get(rows[1])!.value).toBe(4);
		expect(
			new DataPhase<State, AxisPlotEnv>().run(state({ data: rows, gaps }), ENV).gapFillMaps
		).toBeUndefined();
	});

	test('orderSeries reorders the series; colorOrder alone decides which color each takes', () => {
		const sorted = new DataPhase<State, AxisPlotEnv>({
			orderSeries: (series) => [...series].sort((a, b) => a.name.localeCompare(b.name))
		}).run(state(), ENV);
		expect(names(sorted)).toEqual(['A', 'B']);

		const plain = new DataPhase<State, AxisPlotEnv>().run(state(), ENV);
		const recolored = new DataPhase<State, AxisPlotEnv>({
			colorOrder: (series) => [...series].reverse()
		}).run(state(), ENV);
		expect(recolored.colorForSeries!('A')).toBe(plain.colorForSeries!('B'));
	});

	test('drops a series the legend omits, keeping every color and name in place', () => {
		const legendInteraction = new LegendState();
		legendInteraction.turnOff('B', { mode: 'omit' });
		const plain = new DataPhase<State, AxisPlotEnv>().run(state(), ENV);
		const out = new DataPhase<State, AxisPlotEnv>().run(state(), {
			...ENV,
			interaction: new PlotInteraction(() => ENV.cfg, { legend: legendInteraction })
		});
		expect(names(out)).toEqual(['A']);
		expect(out.allSeriesNames).toEqual(['B', 'A']);
		expect(out.colorForSeries!('A')).toBe(plain.colorForSeries!('A'));
	});

	test("scoped groups read a segment's own color through segments.color", () => {
		const out = new DataPhase<State, AxisPlotEnv>({
			segments: { color: (style) => style?.fill }
		}).run(state({ segments: { A: [{ styles: { fill: '#123456' } }] } }), ENV);
		const a = out.scopedGroups!.find((g) => g.name === 'A')!;
		expect(a.segments[0].color).toBe('#123456');
	});

	test('extend adds the plot kind’s own output after the shared one', () => {
		const out = new DataPhase<State & { count?: number }, AxisPlotEnv>({
			extend: (s) => ({ ...s, count: s.resolvedSeries!.length })
		}).run(state(), ENV);
		expect(out.count).toBe(2);
	});
});

describe('MappingPhase', () => {
	const mapped = (overrides: Partial<State> = {}) =>
		new MappingPhase<State, AxisPlotEnv>().run(
			new DataPhase<State, AxisPlotEnv>().run(state(overrides), ENV),
			ENV
		).channels!;

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

	test('grouping defaults to a categorical `color`; a numeric one groups nothing', () => {
		expect(mapped().grouping!.accessor(ROWS[0])).toBe('B');
		expect(mapped({ color: 'y' }).grouping).toBeUndefined();
	});
});

describe('ScalesPhase', () => {
	const prepared = (overrides: Partial<State> = {}) =>
		new TransformsPhase<State, AxisPlotEnv>().run(
			new DataPhase<State, AxisPlotEnv>().run(state(overrides), ENV),
			ENV
		);
	const derived = {
		type: 'line',
		data: [{ a: 10, b: 20 }],
		x: 'a',
		y: 'b'
	} as unknown as AxisBasedMarkersConfig;

	test('with nothing derived and no ranges, every axis is left alone', () => {
		expect(new ScalesPhase<State, AxisPlotEnv>().run(prepared(), ENV).scales).toEqual({});
	});

	test('grows each numeric axis to cover a derived marker, from zero where asked, niced', () => {
		const out = new ScalesPhase<State, AxisPlotEnv>({ zero: ['y'] }).run(
			{ ...prepared(), markers: [derived] },
			ENV
		);
		expect(out.scales.x).toMatchObject({ domain: [0, 10], nice: false });
		expect(out.scales.y).toMatchObject({ domain: [0, 20], nice: false });
	});

	test('an author `nice: false` or own `ticks` keeps the plain extent', () => {
		const run = (y: Record<string, unknown>) =>
			new ScalesPhase<State, AxisPlotEnv>({ zero: ['y'] }).run(
				{ ...prepared({ scales: { y } }), markers: [derived] },
				ENV
			).scales.y;
		expect(run({ nice: false })).toMatchObject({ domain: [0, 20], nice: false });
		expect(run({ ticks: [0, 7, 14] })).toMatchObject({ domain: [0, 20], nice: true });
	});

	test('grows to the ranges a transform gave the rows (a stack’s top)', () => {
		const out = new ScalesPhase<State, AxisPlotEnv>().run(
			prepared({ transforms: [{ type: 'stackY' }] }),
			ENV
		);
		const [, hi] = out.scales.y?.domain as [number, number];
		expect(hi).toBe(10);
	});

	test('a pinned domain is left alone', () => {
		const out = new ScalesPhase<State, AxisPlotEnv>().run(
			{ ...prepared({ scales: { y: { domain: [0, 100] } } }), markers: [derived] },
			ENV
		);
		expect(out.scales.y?.domain).toEqual([0, 100]);
	});
});

describe('Pipeline.ofAxisKind', () => {
	afterEach(() => vi.restoreAllMocks());

	test('every phase, in order: the facet first, the kind’s own markers, then the tooltip and hover', () => {
		const { stages } = Pipeline.ofAxisKind<State, AxisPlotEnv>({ markers: { marks: () => [] } });
		expect(stages.map((s) => s.phase)).toEqual([
			'facet',
			'data',
			'mapping',
			'transforms',
			'context',
			'statistics',
			'sharedScales',
			'scales',
			'styles',
			'markers',
			'tooltip',
			'hover'
		]);
	});

	test('the "tooltip" phase leaves the default format, the same on every plot', () => {
		const shared = runStages(
			Pipeline.ofAxisKind<State, AxisPlotEnv>({ markers: { marks: () => [] } }),
			state({ grouping: 'g' }),
			ENV
		);
		const row = shared.processedData!.data[0];
		expect(shared.tooltipFormat!(row)).toBe(`${String(row.g)}\n${row.x}: ${row.y}`);
	});

	test('a Pipeline warns when stages are declared out of phase order', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const pass = (s: unknown) => s;
		new Pipeline([
			{ phase: 'markers', run: pass },
			{ phase: 'scales', run: pass }
		]);
		expect(warn).toHaveBeenCalledOnce();
	});
});

describe('series identity', () => {
	/** Two series sharing a name, told apart by `id`, as one per facet panel. */
	function twins(): State {
		return {
			...state(),
			resolvedSeries: [
				{
					name: 'A',
					id: 'p1/A',
					x: 'x',
					y: 'y',
					data: [
						{ x: 1, y: 2, g: 'A' },
						{ x: 12, y: 3, g: 'A' }
					]
				},
				{ name: 'A', id: 'p2/A', x: 'x', y: 'y', data: [{ x: 2, y: 4, g: 'A' }] }
			]
		};
	}

	const tags = (s: State) =>
		s.processedData!.data.map((row) => [row[SERIES_KEY], row[SERIES_ID_KEY]]);

	test('each processed row carries its series name and id', () => {
		const out = new TransformsPhase<State>().run(twins(), ENV);
		expect(tags(out)).toEqual([
			['A', 'p1/A'],
			['A', 'p1/A'],
			['A', 'p2/A']
		]);
	});

	test('a series without its own id is identified by its name', () => {
		const out = new TransformsPhase<State>().run(
			new DataPhase<State, AxisPlotEnv>().run(state(), ENV),
			ENV
		);
		expect(new Set(tags(out).map(([name, id]) => name === id))).toEqual(new Set([true]));
	});

	test('an aggregating transform keeps same-name series apart, each row keeping its name', () => {
		const out = new TransformsPhase<State>().run(
			{ ...twins(), transforms: [{ type: 'binX', thresholds: [0, 10, 20] }] },
			ENV
		);
		// p1/A: [0,10) and [10,20); p2/A: [0,10)
		expect(tags(out).sort()).toEqual([
			['A', 'p1/A'],
			['A', 'p1/A'],
			['A', 'p2/A']
		]);
	});

	test('leaves the processed rows split back into one group per series id', () => {
		const out = new TransformsPhase<State>().run(twins(), ENV);
		expect(out.processedGroups!.map((g) => [g.series.id, g.series.data.length])).toEqual([
			['p1/A', 2],
			['p2/A', 1]
		]);
	});

	test("with `groups: 'runs'`, leaves runs of consecutive rows in the rows' own order", () => {
		const out = new TransformsPhase<State>({ groups: 'runs' }).run(
			{ ...twins(), transforms: [{ type: 'reverse' }] },
			ENV
		);
		expect(out.processedGroups!.map((g) => [g.series.id, g.series.data.length])).toEqual([
			['p2/A', 1],
			['p1/A', 2]
		]);
	});
});
