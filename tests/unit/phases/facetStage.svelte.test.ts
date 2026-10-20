import { describe, test, expect } from 'vitest';
import { Pipeline } from '$lib/phases/Pipeline';
import { FacetPhase } from '$lib/phases/facet/FacetPhase';
import { PANEL_KEY, FacetPanels } from '$lib/phases/facet/FacetPanels';
import { SERIES_ID_KEY, SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { buildLineDefaults } from '$lib/plots/line/defaults';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import type { AxisPlotState, AxisPlotCtx } from '$lib/types/phases';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { LinePlotCtx, LinePlotState } from '$lib/types/plots/line/state';
import { runStages } from '../plots/_helpers/stages';

type Row = { anio: number; region: string; sector: string; valor: number };
type State = AxisPlotState<Row, { fill?: string }>;

const ROWS: Row[] = [
	{ anio: 2022, region: 'Norte', sector: 'Agro', valor: 12 },
	{ anio: 2022, region: 'Norte', sector: 'Industria', valor: 8 },
	{ anio: 2023, region: 'Norte', sector: 'Agro', valor: 15 },
	{ anio: 2023, region: 'Norte', sector: 'Industria', valor: 9 },
	{ anio: 2022, region: 'Sur', sector: 'Agro', valor: 7 },
	{ anio: 2022, region: 'Sur', sector: 'Industria', valor: 5 },
	{ anio: 2023, region: 'Sur', sector: 'Agro', valor: 10 },
	{ anio: 2023, region: 'Sur', sector: 'Industria', valor: 6 }
];

const CTX: AxisPlotCtx = { cfg: DEFAULT_CONFIG };

function state(overrides: Partial<State> = {}): State {
	return {
		data: ROWS,
		x: 'anio',
		y: 'valor',
		color: 'sector',
		facet: { by: 'region' },
		scales: {},
		width: 400,
		height: 300,
		...overrides
	};
}

/** The whole shared pipeline, with a kind that draws nothing of its own. */
function run(overrides: Partial<State> = {}): State {
	return runStages(
		Pipeline.ofAxisKind<State, AxisPlotCtx>({ markers: { marks: () => [] } }),
		state(overrides),
		CTX
	);
}

const panelOfRow = (row: Record<string | symbol, unknown>) => row[PANEL_KEY];

describe('FacetPhase', () => {
	test('lays out one panel per `by` value, in data order, narrowed by `values`', () => {
		expect(new FacetPhase<State>().run(state()).panels).toEqual([
			{ key: 'Norte', label: 'Norte' },
			{ key: 'Sur', label: 'Sur' }
		]);
		const narrowed = new FacetPhase<State>().run(
			state({ facet: { by: 'region', values: ['Sur'] } })
		);
		expect(narrowed.panels!.map((p) => p.key)).toEqual(['Sur']);
		expect(narrowed.panelOf!(ROWS[0])).toBeUndefined();
		expect(narrowed.panelOf!(ROWS[4])).toBe('Sur');
	});

	test('a `rows`/`cols` grid has one panel per non-empty combination, row by row', () => {
		const out = new FacetPhase<State>().run(state({ facet: { rows: 'region', cols: 'sector' } }));
		expect(out.panels!.map((p) => [p.row, p.col, p.label])).toEqual([
			['Norte', 'Agro', 'Norte · Agro'],
			['Norte', 'Industria', 'Norte · Industria'],
			['Sur', 'Agro', 'Sur · Agro'],
			['Sur', 'Industria', 'Sur · Industria']
		]);
	});

	test('a plot without a facet, or drawn from pre-built series, has no panels', () => {
		expect(new FacetPhase<State>().run(state({ facet: undefined })).panels).toBeUndefined();
		const series = [{ name: 'A', x: 'anio', y: 'valor', data: ROWS }] as State['series'];
		expect(new FacetPhase<State>().run(state({ series, data: undefined })).panels).toBeUndefined();
	});
});

describe('the pipeline over every panel at once', () => {
	test('"data" splits each series into one per panel, same name, own id and panel', () => {
		const out = run();
		expect(out.resolvedSeries!.map((s) => [s.panel, s.name, s.id, s.data.length])).toEqual([
			['Norte', 'Agro', FacetPanels.buildSeriesId('Norte', 'Agro'), 2],
			['Norte', 'Industria', FacetPanels.buildSeriesId('Norte', 'Industria'), 2],
			['Sur', 'Agro', FacetPanels.buildSeriesId('Sur', 'Agro'), 2],
			['Sur', 'Industria', FacetPanels.buildSeriesId('Sur', 'Industria'), 2]
		]);
		expect(out.allSeriesNames).toEqual(['Agro', 'Industria']);
		expect(out.scopedGroups!.map((g) => g.panel)).toEqual(['Norte', 'Norte', 'Sur', 'Sur']);
	});

	test('a series keeps its color in a panel that lacks another series', () => {
		const withoutSurAgro = ROWS.filter((r) => !(r.region === 'Sur' && r.sector === 'Agro'));
		const out = run({ data: withoutSurAgro });
		const sur = out.resolvedSeries!.filter((s) => s.panel === 'Sur').map((s) => s.name);
		expect(sur).toEqual(['Industria']);
		const alone = runStages(
			Pipeline.ofAxisKind<State, AxisPlotCtx>({ markers: { marks: () => [] } }),
			state({ data: withoutSurAgro.filter((r) => r.region === 'Sur'), facet: undefined }),
			CTX
		);
		// On its own, Sur's only series takes the first palette color; across panels it keeps Industria's.
		expect(out.colorForSeries!('Industria')).toBe(DEFAULT_CONFIG.palette[1]);
		expect(alone.colorForSeries!('Industria')).toBe(DEFAULT_CONFIG.palette[0]);
	});

	test('every processed row carries its series name, id and panel', () => {
		const row = run().processedData!.data[4];
		expect([row[SERIES_KEY], row[SERIES_ID_KEY], row[PANEL_KEY]]).toEqual([
			'Agro',
			FacetPanels.buildSeriesId('Sur', 'Agro'),
			'Sur'
		]);
	});

	test('a stack never stacks one panel on another', () => {
		const out = run({ transforms: [{ type: 'stackY' }] });
		const y1 = out.processedData!.channels.y1 as symbol;
		const baselines = out
			.processedData!.data.filter((row) => row.anio === 2022 && row[SERIES_KEY] === 'Agro')
			.map((row) => [row[PANEL_KEY], row[y1]]);
		expect(baselines).toEqual([
			['Norte', 0],
			['Sur', 0]
		]);
	});

	test('a bin keeps each panel and series apart, each bin keeping its panel', () => {
		const out = run({
			x: 'valor',
			y: undefined,
			transforms: [{ type: 'binX', thresholds: [0, 10, 20] }]
		});
		const bins = out.processedData!.data.map((row) => `${row[PANEL_KEY]}/${row[SERIES_KEY]}`);
		expect(bins.sort()).toEqual([
			'Norte/Agro',
			'Norte/Industria',
			'Sur/Agro',
			'Sur/Agro',
			'Sur/Industria'
		]);
	});

	test('statistics resolve once per panel, each marker tagged with its panel', () => {
		const out = run({ statistics: [{ type: 'movingAverage', k: 2 }] });
		const markers = out.markers as (AxisBasedMarkersConfig & Record<string, unknown>)[];
		expect(markers.map((m) => m[PANEL_KEY])).toEqual(['Norte', 'Norte', 'Sur', 'Sur']);
		const sur = markers.filter((m) => m[PANEL_KEY] === 'Sur');
		for (const marker of sur) {
			expect((marker.data as Row[]).every((row) => row.region === 'Sur')).toBe(true);
		}
	});

	test('an author marker drawing the plot rows is resolved per panel, over its rows', () => {
		const dot = {
			type: 'dot',
			transforms: [{ type: 'selectLast' }]
		} as unknown as AxisBasedMarkersConfig;
		const out = run({ authorMarkers: [dot] });
		const markers = out.markers as (AxisBasedMarkersConfig & Record<string, unknown>)[];
		expect(markers.map((m) => m[PANEL_KEY])).toEqual(['Norte', 'Sur']);
		const regions = markers.map((m) => [...new Set((m.data as Row[]).map((r) => r.region))]);
		expect(regions).toEqual([['Norte'], ['Sur']]);
	});

	test('line value labels keep one label per series in every panel', () => {
		const lineCtx: LinePlotCtx = { cfg: DEFAULT_CONFIG };
		const out = runStages(
			Pipeline.ofAxisKind(buildLineDefaults<Row>()),
			{ ...state(), values: { show: true } } as LinePlotState<Row>,
			lineCtx
		);
		const label = out.markers!.find((m) => m.type === 'text') as {
			data: Record<string | symbol, unknown>[];
		};
		expect(label.data.map((row) => `${panelOfRow(row)}/${row[SERIES_KEY]}`)).toEqual([
			'Norte/Agro',
			'Norte/Industria',
			'Sur/Agro',
			'Sur/Industria'
		]);
	});

	test('without a facet nothing is split or tagged', () => {
		const out = run({ facet: undefined });
		expect(out.panels).toBeUndefined();
		expect(out.resolvedSeries!.map((s) => s.id)).toEqual([undefined, undefined]);
		expect(out.processedData!.data.some((row) => PANEL_KEY in row)).toBe(false);
	});
});
