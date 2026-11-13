import { describe, expect, test } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { Margins } from '$lib/layout/margins/Margins';
import { RowContext } from '$lib/phases/context/RowContext';
import { buildSankeyDefaults } from '$lib/plots/flow/sankey/defaults';
import { FLOW_ROW } from '$lib/plots/families/graph/arrangements/FlowArrangement';
import type { ProcessedRow } from '$lib/types/phases';
import type { SankeyRowContext } from '$lib/types/plots/flow/sankey/props';

type Row = Record<string, unknown>;
type Marker = {
	type: string;
	data: ProcessedRow[];
	styles?: Row;
	text?: (row: Row) => string;
} & Row;
type Ran = {
	processedData: { data: ProcessedRow[]; options: Row };
	allSeriesNames: string[];
	markers: Marker[];
	scales: Record<'x' | 'y', Row>;
	colorForSeries: (name: string) => string;
};

const WIDTH = 600;
const HEIGHT = 400;

const TRIPS = [
	{ home: 'CABA', work: 'CABA', people: 50 },
	{ home: 'CABA', work: 'GBA', people: 10 },
	{ home: 'GBA', work: 'CABA', people: 30 },
	{ home: 'GBA', work: 'GBA', people: 60 },
	{ home: 'Interior', work: 'GBA', people: 5 }
];
/** Where people live and where they work, as a table and the columns the plot makes its graph of. */
const GRAPH = { data: TRIPS, columns: ['home', 'work'], value: 'people' };

function run(source: Row, options: { legend?: LegendState; [key: string]: unknown } = {}): Ran {
	const { legend = null, ...props } = options;
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend });
	return Pipeline.ofAxisKind(buildSankeyDefaults()).run(
		{
			width: WIDTH,
			height: HEIGHT,
			scales: {},
			segments: {},
			markers: [],
			...source,
			...props
		},
		{ cfg: DEFAULT_CONFIG, interaction }
	) as unknown as Ran;
}

const nodesOf = (ran: Ran) => ran.processedData.data.filter((r) => r[FLOW_ROW.kind] === 'node');
const linksOf = (ran: Ran) => ran.processedData.data.filter((r) => r[FLOW_ROW.kind] === 'link');
const contextOf = (row: ProcessedRow) => RowContext.of<SankeyRowContext>(row);
const ribbonOf = (ran: Ran) =>
	ran.markers.find((m) => m.type === 'ribbon' && m.styles?.fill !== 'transparent')!;
const barsOf = (ran: Ran) =>
	ran.markers.filter((m) => m.type === 'bar' && m.styles?.fill !== 'transparent');
const fillOf = (marker: Marker, row: ProcessedRow) =>
	(marker.styles!.fill as (row: ProcessedRow) => string)(row);
const box = () => Margins.resolve(DEFAULT_CONFIG.margins).contentBox(WIDTH, HEIGHT);

describe('SankeyPlot - the nodes as the series', () => {
	test('every node label is a series, once, in the order of the nodes', () => {
		expect(run(GRAPH).allSeriesNames).toEqual(['CABA', 'GBA', 'Interior']);
	});

	test('a label no link leaves is a series with rows, so the legend lists it, and draws nothing more', () => {
		const data = { data: [{ source: 'Solar', target: 'Grid', value: 4 }] };
		const ran = run(data) as Ran & { resolvedSeries: { name: string; data: unknown[] }[] };
		const grid = ran.resolvedSeries.find((series) => series.name === 'Grid')!;
		expect(grid.data.length).toBeGreaterThan(0);
		expect(nodesOf(ran)).toHaveLength(2);
		expect(linksOf(ran)).toHaveLength(1);
	});

	test('a node takes the color of its label, in every column', () => {
		const ran = run(GRAPH);
		for (const bar of barsOf(ran)) {
			const [label] = new Set(bar.data.map((row) => contextOf(row).name));
			expect(bar.styles!.fill).toBe(ran.colorForSeries(label));
		}
		expect(barsOf(ran).flatMap((bar) => bar.data)).toHaveLength(5);
	});

	test("a link takes its source's color, or its target's with styles.links.fill", () => {
		const bySource = run(GRAPH);
		const byTarget = run(GRAPH, { styles: { links: { fill: 'target' } } });
		for (const ran of [bySource, byTarget]) {
			for (const link of linksOf(ran)) {
				const context = contextOf(link);
				const end = ran === bySource ? context.source : context.target;
				expect(fillOf(ribbonOf(ran), link)).toBe(ran.colorForSeries(end));
			}
		}
	});

	test("styles.links.fill as a function picks each link's end", () => {
		const ran = run(GRAPH, {
			styles: {
				links: {
					fill: (_: unknown, link: SankeyRowContext) =>
						link.source === 'Interior' ? 'target' : '#123456'
				}
			}
		});
		for (const link of linksOf(ran)) {
			const own = contextOf(link);
			const expected = own.source === 'Interior' ? ran.colorForSeries(own.target) : '#123456';
			expect(fillOf(ribbonOf(ran), link)).toBe(expected);
		}
	});

	test("color: 'target' makes the series the labels of the nodes the links reach", () => {
		const ran = run(GRAPH, { color: 'target' });
		const link = linksOf(ran).find((row) => contextOf(row).source === 'Interior')!;
		expect(contextOf(link).series).toBe('GBA');
	});

	test('a label the legend omits takes its nodes and every link they are an end of', () => {
		const legend = new LegendState();
		legend.turnOff('CABA', { mode: 'omit' });
		const ran = run(GRAPH, { legend });
		expect(nodesOf(ran).map((row) => contextOf(row).name)).toEqual(['GBA', 'Interior', 'GBA']);
		for (const link of linksOf(ran)) {
			expect([contextOf(link).source, contextOf(link).target]).not.toContain('CABA');
		}
	});

	test('a dimmed label dims its nodes and the links it colors', () => {
		const legend = new LegendState();
		legend.turnOff('GBA', { mode: 'dim' });
		const ran = run(GRAPH, { legend });
		const opacityOf = (row: ProcessedRow) =>
			(ribbonOf(ran).styles!.fillOpacity as (row: ProcessedRow) => number)(row);
		const [fromGba, fromCaba] = ['GBA', 'CABA'].map(
			(label) => linksOf(ran).find((row) => contextOf(row).source === label)!
		);
		expect(opacityOf(fromGba)).toBeLessThan(opacityOf(fromCaba));
		const gba = barsOf(ran).find((bar) => contextOf(bar.data[0]).name === 'GBA')!;
		expect(gba.styles!.fillOpacity).toBeLessThan(1);
	});
});

describe('SankeyPlot - a value of the links as the series', () => {
	const BY_YEAR = {
		data: TRIPS.flatMap((trip) => [
			{ ...trip, year: '2003' },
			{ ...trip, year: '2025', people: trip.people * 2 }
		]),
		columns: ['home', 'work'],
		value: 'people'
	};

	test('the series are its values, and the nodes take the neutral fill', () => {
		const ran = run(BY_YEAR, { color: 'year' });
		expect(ran.allSeriesNames).toEqual(['2003', '2025']);
		expect(barsOf(ran)).toHaveLength(1);
		expect(barsOf(ran)[0].styles!.fill).toBe(DEFAULT_CONFIG.sankey.nodes.fill);
		for (const link of linksOf(ran)) {
			expect(fillOf(ribbonOf(ran), link)).toBe(ran.colorForSeries(String(link.year)));
		}
	});

	test('a value the legend omits takes its links alone', () => {
		const legend = new LegendState();
		legend.turnOff('2003', { mode: 'omit' });
		const ran = run(BY_YEAR, { color: 'year', legend });
		expect(new Set(linksOf(ran).map((row) => row.year))).toEqual(new Set(['2025']));
		expect(nodesOf(ran)).toHaveLength(5);
	});

	test('opacity fades the links by a value of theirs', () => {
		const ran = run(BY_YEAR, { color: 'year', opacity: 'people' });
		expect(ribbonOf(ran).opacity).toBe('people');
	});
});

describe('SankeyPlot - its size in px', () => {
	test('a node is styles.nodes.width px wide, the first and last columns at the edges', () => {
		const ran = run(GRAPH, { styles: { nodes: { width: 20 } } });
		const x = ran.scales.x as { domain: string[]; paddingInner: number; paddingOuter: number };
		expect(x.domain).toEqual(['home', 'work']);
		// A band scale's step and bandwidth, as d3's are worked out.
		const { width } = box();
		const step = width / (x.domain.length - x.paddingInner + 2 * x.paddingOuter);
		const bandwidth = step * (1 - x.paddingInner);
		expect(bandwidth).toBeCloseTo(20);
		expect(step * x.paddingOuter).toBeCloseTo(0);
		expect(step * x.paddingOuter + step + bandwidth).toBeCloseTo(width);
	});

	test('the nodes of the fullest column are styles.nodes.padding px apart', () => {
		const ran = run(GRAPH, { styles: { nodes: { padding: 30 } } });
		const height = (ran.scales.y.domain as number[])[1];
		const home = nodesOf(ran)
			.filter((row) => row[FLOW_ROW.x] === 'home')
			.sort((a, b) => Number(a[FLOW_ROW.y1]) - Number(b[FLOW_ROW.y1]));
		const gap = Number(home[1][FLOW_ROW.y1]) - Number(home[0][FLOW_ROW.y2]);
		expect((gap * box().height) / height).toBeCloseTo(30);
	});

	test("the author's scales win over the fitted ones", () => {
		const ran = run(GRAPH, { scales: { x: { domain: ['work', 'home'] } } });
		expect(ran.scales.x.domain).toEqual(['work', 'home']);
	});
});

describe('SankeyPlot - its labels', () => {
	test('a node is labelled with its name and the value through it', () => {
		const ran = run(GRAPH);
		const [labels] = ran.markers.filter((m) => m.type === 'text');
		expect(nodesOf(ran).map((row) => labels.text!(row))).toEqual([
			'CABA 60',
			'GBA 90',
			'Interior 5',
			'CABA 80',
			'GBA 75'
		]);
	});

	test("format gets the node's links in its context", () => {
		const ran = run(GRAPH, {
			styles: {
				values: {
					format: (_: number, __: unknown, context: SankeyRowContext) =>
						`${context.incoming.length}/${context.outgoing.length}`
				}
			}
		});
		const [labels] = ran.markers.filter((m) => m.type === 'text');
		expect(nodesOf(ran).map((row) => labels.text!(row))).toEqual([
			'CABA 0/2',
			'GBA 0/2',
			'Interior 0/1',
			'CABA 2/0',
			'GBA 3/0'
		]);
	});

	test("a node's share is of its column, a link's of the nodes it joins", () => {
		const ran = run(GRAPH);
		const gba = nodesOf(ran).find(
			(row) => contextOf(row).name === 'GBA' && row[FLOW_ROW.x] === 'work'
		)!;
		// 75 of the 155 who work somewhere work in GBA.
		expect(contextOf(gba).share).toBeCloseTo((75 / 155) * 100);
		const link = contextOf(gba).incoming.find((own) => own.source === 'CABA')!;
		// 10 of CABA's 60 commute to GBA, 10 of GBA's 75 workers.
		expect(link.sourceShare).toBeCloseTo((10 / 60) * 100);
		expect(link.targetShare).toBeCloseTo((10 / 75) * 100);
		expect(link.row).toBe(linksOf(ran).find((row) => contextOf(row).name === 'CABA - GBA'));
	});

	test('names the columns only when the nodes stand in named ones', () => {
		const titles = (ran: Ran) => ran.markers.filter((m) => m.type === 'text').length;
		expect(titles(run(GRAPH))).toBe(2);
		const unnamed = { data: [{ source: 'a', target: 'b', value: 1 }] };
		expect(titles(run(unnamed))).toBe(1);
	});
});

describe('SankeyPlot - a table as its data', () => {
	const ROWS = TRIPS.flatMap((trip) => [
		{ ...trip, year: '2003', mode: 'train' },
		{ ...trip, year: '2025', mode: 'car' }
	]);

	const linkRowsOf = (ran: Ran) => linksOf(ran).map((row) => contextOf(row).row as Row);

	test('keeps its links apart by every field the plot reads, and not by the others', () => {
		const ran = run(
			{ data: ROWS, columns: ['home', 'work'], value: 'people' },
			{
				color: 'year',
				opacity: 'people'
			}
		);
		expect(linksOf(ran)).toHaveLength(TRIPS.length * 2);
		for (const link of linksOf(ran)) {
			expect(link.year).toBeDefined();
			expect(link.mode).toBeUndefined();
		}
	});

	test('keeps its links apart by grouping, which colors nothing', () => {
		const ran = run(
			{ data: ROWS, columns: ['home', 'work'], value: 'people' },
			{
				grouping: 'mode'
			}
		);
		expect(linksOf(ran)).toHaveLength(TRIPS.length * 2);
		expect(ran.allSeriesNames).toEqual(['CABA', 'GBA', 'Interior']);
	});

	test('sums each link under the field its value is read from', () => {
		const ran = run({ data: ROWS, columns: ['home', 'work'], value: 'people' });
		const link = linksOf(ran).find((row) => contextOf(row).source === 'Interior')!;
		expect(link.people).toBe(10);
	});

	test('takes links as they are, read by from, to and value, with their nodes', () => {
		const ran = run({
			data: [{ origin: 1, destination: 2, n: 7 }],
			from: 'origin',
			to: 'destination',
			value: 'n',
			nodes: {
				data: [
					{ key: 1, title: 'Home', side: 'left' },
					{ key: 2, title: 'Work', side: 'right' }
				],
				id: 'key',
				label: 'title',
				column: 'side'
			}
		});
		expect(nodesOf(ran).map((row) => [contextOf(row).name, row[FLOW_ROW.x]])).toEqual([
			['Home', 'left'],
			['Work', 'right']
		]);
		expect(linkRowsOf(ran)).toHaveLength(1);
		expect(contextOf(linksOf(ran)[0]).value).toBe(7);
	});
});

describe('SankeyPlot - where a link starts and ends', () => {
	test("its context has each end's column and the middle of the link there", () => {
		const ran = run(GRAPH);
		for (const link of linksOf(ran)) {
			const { start, end } = contextOf(link);
			expect(start).toEqual({
				column: 'home',
				y: (Number(link[FLOW_ROW.y1]) + Number(link[FLOW_ROW.y2])) / 2
			});
			expect(end).toEqual({
				column: 'work',
				y: (Number(link[FLOW_ROW.y3]) + Number(link[FLOW_ROW.y4])) / 2
			});
		}
	});
});

describe('SankeyPlot - where its labels sit', () => {
	const sides = (ran: Ran) => {
		const [labels] = ran.markers.filter((m) => m.type === 'text') as (Marker & {
			textAnchor: (row: ProcessedRow) => string;
		})[];
		return nodesOf(ran).map((row) => `${row[FLOW_ROW.x]}:${labels.textAnchor(row)}`);
	};

	test("'auto' writes every column's toward the middle", () => {
		expect(new Set(sides(run(GRAPH)))).toEqual(new Set(['home:start', 'work:end']));
	});

	test("'outside' writes the first and last columns' past the edges", () => {
		const ran = run(GRAPH, { styles: { values: { position: 'outside' } } });
		expect(new Set(sides(ran))).toEqual(new Set(['home:end', 'work:start']));
	});
});
