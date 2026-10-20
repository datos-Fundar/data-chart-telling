import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { GAP_KIND, GAP_VALUE } from '$lib/phases/transforms/TransformsPhase';
import { resolveAccessor } from '$lib/utils/accessors';
import { buildBarDefaults } from '$lib/plots/bar/defaults';
import { buildLineDefaults } from '$lib/plots/line/defaults';
import { buildPyramidDefaults } from '$lib/plots/pyramid/defaults';
import type { AxisPlotDefaults, ProcessedData, ProcessedRow } from '$lib/types/phases';

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
