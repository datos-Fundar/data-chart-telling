import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { GAP_KIND, GAP_VALUE } from '$lib/phases/transforms/TransformsPhase';
import { resolveAccessor } from '$lib/utils/accessors';
import { buildBarDefaults } from '$lib/plots/ranking/bar/defaults';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import { buildPyramidDefaults } from '$lib/plots/distribution/pyramid/defaults';
import { buildClevelandDefaults } from '$lib/plots/ranking/cleveland/defaults';
import type { AxisPlotDefaults, ProcessedData, ProcessedRow } from '$lib/types/phases';
import type { ValueSelect } from '$lib/types/layout/styles';

type Row = Record<string, unknown>;

/** What a kind's pipeline leaves in `processedData` for these props. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processedOf(kind: AxisPlotDefaults<any, any>, props: Row): ProcessedData {
	const state = Pipeline.ofAxisKind(kind).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG }
	) as unknown as { processedData: ProcessedData };
	return state.processedData;
}

const ROWS: Row[] = [
	{ c: 'A', v: 2 },
	{ c: 'B', v: null },
	{ c: 'C', v: 6 }
];
const GAPS = { default: { middle: {} } };

describe('TransformsPhase - gaps a plot fills', () => {
	test('a filled gap carries its value and kind, and its value channel reads it', () => {
		const { data, channels } = processedOf(buildBarDefaults<Row>(), {
			data: ROWS,
			x: 'c',
			y: 'v',
			styles: { gaps: GAPS }
		});
		const gap = data.find((row) => row.c === 'B')!;
		expect(gap[GAP_VALUE]).toBe(4);
		expect(gap[GAP_KIND]).toBe('middle');
		const value = resolveAccessor(channels.y as never) as (row: ProcessedRow) => unknown;
		expect(value(gap)).toBe(4);
		expect(value(data[0])).toBe(2);
		expect(data[0][GAP_VALUE]).toBeUndefined();
	});

	test('with no fills, the value channel is the series own', () => {
		const { data, channels } = processedOf(buildBarDefaults<Row>(), { data: ROWS, x: 'c', y: 'v' });
		expect(channels.y).toBe('v');
		expect(data.some((row) => row[GAP_VALUE] !== undefined)).toBe(false);
	});

	test('on a horizontal plot it is the x channel that reads the filled value', () => {
		const { data, channels } = processedOf(buildBarDefaults<Row>(), {
			data: ROWS,
			x: 'v',
			y: 'c',
			styles: { gaps: GAPS }
		});
		const gap = data.find((row) => row.c === 'B')!;
		const read = resolveAccessor(channels.x as never) as (row: ProcessedRow) => unknown;
		expect(read(gap)).toBe(4);
		expect(channels.y).toBe('c');
	});

	test('every discrete kind fills, a continuous one bridges its gaps instead', () => {
		const pyramid = processedOf(buildPyramidDefaults<Row>(), {
			data: ROWS,
			x: 'v',
			y: 'c',
			styles: { gaps: GAPS }
		});
		expect(pyramid.data.find((row) => row.c === 'B')![GAP_VALUE]).toBe(4);
		const line = processedOf(buildLineDefaults<Row>(), {
			data: [
				{ c: 1, v: 2 },
				{ c: 2, v: null },
				{ c: 3, v: 6 }
			],
			x: 'c',
			y: 'v',
			styles: { gaps: GAPS }
		});
		expect(line.data.some((row) => row[GAP_VALUE] !== undefined)).toBe(false);
	});
});

describe('TransformsPhase - the rows the value labels are written for', () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const labelledOf = (kind: AxisPlotDefaults<any, any>, props: Row) => {
		const state = Pipeline.ofAxisKind(kind).run(
			{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
			{ cfg: DEFAULT_CONFIG }
		) as unknown as { labelled?: ProcessedRow[]; labelSelects?: ValueSelect[] };
		return state;
	};
	const line = [
		{ t: 1, v: 5, g: 'a' },
		{ t: 2, v: 9, g: 'a' },
		{ t: 3, v: 7, g: 'a' },
		{ t: 1, v: 2, g: 'b' },
		{ t: 2, v: 1, g: 'b' }
	];
	const values = (rows?: ProcessedRow[]) => rows?.map((row) => row.v);

	test('none while the labels are off', () => {
		expect(
			labelledOf(buildLineDefaults<Row>(), { data: line, x: 't', y: 'v', color: 'g' }).labelled
		).toBeUndefined();
	});

	test("a line labels each series' last point unless `select` says otherwise", () => {
		const props = { data: line, x: 't', y: 'v', color: 'g' };
		const state = labelledOf(buildLineDefaults<Row>(), {
			...props,
			styles: { values: { show: true } }
		});
		expect(values(state.labelled)).toEqual([7, 1]);
		expect(state.labelSelects).toEqual(['last']);
		const picked = (select: unknown) =>
			values(
				labelledOf(buildLineDefaults<Row>(), {
					...props,
					styles: { values: { show: true, select } }
				}).labelled
			);
		expect(picked('first')).toEqual([5, 2]);
		expect(picked('max')).toEqual([9, 2]);
		expect(picked('min')).toEqual([5, 1]);
	});

	test("a list is the union of its selectors, each row once, in the rows' own order", () => {
		const picked = values(
			labelledOf(buildLineDefaults<Row>(), {
				data: line,
				x: 't',
				y: 'v',
				color: 'g',
				styles: { values: { show: true, select: ['last', 'max', 'first', 'max'] } }
			}).labelled
		);
		expect(picked).toEqual([5, 9, 7, 2, 1]);
	});

	test('`series` keeps only the rows of those series', () => {
		const state = labelledOf(buildLineDefaults<Row>(), {
			data: line,
			x: 't',
			y: 'v',
			color: 'g',
			styles: { values: { show: true, series: 'b' } }
		});
		expect(values(state.labelled)).toEqual([1]);
	});

	test('the Cleveland family groups by category instead, and leaves out a row with no value', () => {
		const rows = [
			{ c: 'a', v: 1, g: 'x' },
			{ c: 'a', v: 4, g: 'y' },
			{ c: 'b', v: null, g: 'x' },
			{ c: 'b', v: 6, g: 'y' }
		];
		const state = labelledOf(buildClevelandDefaults<Row>(), {
			data: rows,
			x: 'c',
			y: 'v',
			color: 'g',
			styles: { values: { show: true, select: 'first' } }
		});
		// The first dot of each category: the second one's first has no value, so its `y` is.
		expect(values(state.labelled)).toEqual([1, 6]);
	});

	test('with a facet, each panel picks its own rows', () => {
		const faceted = line
			.map((row) => ({ ...row, p: 'one' }))
			.concat(line.map((row) => ({ ...row, v: row.v + 10, p: 'two' })));
		const props = {
			width: 400,
			height: 300,
			scales: {},
			segments: {},
			markers: [],
			data: faceted,
			x: 't',
			y: 'v',
			color: 'g',
			styles: { values: { show: true } }
		};
		const state = Pipeline.ofAxisKind(buildLineDefaults<Row>()).runData(
			props,
			faceted,
			{ by: 'p' } as never,
			null,
			DEFAULT_CONFIG
		) as unknown as { labelled?: ProcessedRow[] };
		// A series' last point in each of the two panels, not just in the last one.
		expect(values(state.labelled)?.sort((a, b) => Number(a) - Number(b))).toEqual([1, 7, 11, 17]);
	});
});
