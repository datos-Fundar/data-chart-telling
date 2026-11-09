import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { RowContext } from '$lib/phases/context/RowContext';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildDensityDefaults } from '$lib/plots/distribution/density/defaults';
import { buildHistogramDefaults } from '$lib/plots/distribution/histogram/defaults';
import { buildBoxDefaults } from '$lib/plots/distribution/box/defaults';
import { buildTreemapDefaults } from '$lib/plots/part-of-a-whole/treemap/defaults';
import { buildBarDefaults } from '$lib/plots/ranking/bar/defaults';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import type { HoverPoint } from '$lib/types/layout/hover';
import type { HoverConfig } from '$lib/types/plots/props';
import type { AxisPlotDefaults, ProcessedData } from '$lib/types/phases';

type Row = Record<string, unknown>;
type Ran = {
	processedData: ProcessedData;
	hover: HoverConfig<Row> & { points: HoverPoint<Row>[] };
	tooltipFormat: (row: Row) => string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function run(kind: AxisPlotDefaults<any, any>, props: Row): Ran {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend: null });
	return Pipeline.ofAxisKind(kind).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as unknown as Ran;
}

const contexts = (ran: Ran) => ran.processedData.data.map((row) => RowContext.of(row));

describe('the row context', () => {
	test('gives every row its series, x, y and own value - a stacked row its own, not the total', () => {
		const data = [
			{ year: 2020, region: 'N', value: 3 },
			{ year: 2020, region: 'S', value: 4 }
		];
		const ran = run(buildBarDefaults(), {
			data,
			x: 'year',
			y: 'value',
			color: 'region',
			transforms: [{ type: 'stackY' }]
		});
		expect(contexts(ran).map(({ series, x, y, value }) => [series, x, y, value])).toEqual([
			['N', 2020, 3, 3],
			['S', 2020, 4, 4]
		]);
	});

	test('a density point reads as the point it is estimated at and its estimate', () => {
		const data = [1, 2, 2, 3, 3, 3, 4, 4, 5].map((v) => ({ v, g: v > 3 ? 'b' : 'a' }));
		const ran = run(buildDensityDefaults(), { data, x: 'v', grouping: 'g' });
		const all = contexts(ran);
		expect(all.length).toBeGreaterThan(0);
		for (const { x, value, series } of all) {
			expect(Number.isFinite(Number(x))).toBe(true);
			expect(Number.isFinite(value)).toBe(true);
			expect(['a', 'b']).toContain(series);
		}
		// The tooltip and the hover read the same estimate.
		const [point] = ran.hover.points;
		expect(ran.tooltipFormat(point.row)).not.toContain('NaN');
		expect(point.context?.value).toBe(RowContext.of(point.row).value);
	});

	test('a histogram bin carries its count and edges, and its value is its count', () => {
		const data = [{ v: 1 }, { v: 2 }, { v: 12 }];
		const ran = run(buildHistogramDefaults(), {
			data,
			x: 'v',
			transforms: [{ type: 'binX', thresholds: [0, 10, 20] }]
		});
		const bins = contexts(ran).filter((c) => (c as { count?: number }).count! > 0);
		expect(bins.map((c) => [c.value, (c as Row).from, (c as Row).to])).toEqual([
			[2, 1, 10],
			[1, 10, 12]
		]);
	});

	test("a box's values carry its summary, and its hover rows read the median as their value", () => {
		const data = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => ({ cat: 'A', v }));
		const ran = run(buildBoxDefaults(), { data, x: 'cat', y: 'v' });
		const [first] = contexts(ran) as (Row & { median: number; p25: number })[];
		expect(first.median).toBe(5);
		expect(first.value).toBe(1);
		const [box] = ran.hover.points;
		expect(box.context?.value).toBe(5);
		expect(box.label).toBe('5');
	});

	test('a treemap tile carries its name, path, value and share, and no x or y', () => {
		const data = [
			{ sector: 'A', value: 30 },
			{ sector: 'B', value: 10 }
		];
		const ran = run(buildTreemapDefaults(), { data, value: 'value', grouping: 'sector' });
		const tiles = contexts(ran) as (Row & { share: number; name: string })[];
		expect(tiles.map((t) => [t.name, t.value, t.share, t.x, t.y])).toEqual([
			['A', 30, 75, undefined, undefined],
			['B', 10, 25, undefined, undefined]
		]);
	});

	test('survives a copy of its row, as a mark accessor gets one', () => {
		const ran = run(buildLineDefaults(), {
			data: [{ x: 1, y: 2 }],
			x: 'x',
			y: 'y'
		});
		const [row] = ran.processedData.data;
		expect(RowContext.of({ ...row }).value).toBe(2);
	});

	test("every format gets it: a tooltip's and the value labels'", () => {
		const seen: unknown[] = [];
		const ran = run(buildLineDefaults(), {
			data: [{ x: 1, y: 2, region: 'N' }],
			x: 'x',
			y: 'y',
			color: 'region',
			tooltip: {
				format: (_row: Row, _number: unknown, context: { series?: string; value?: number }) =>
					`${context.series}=${context.value}`
			},
			styles: {
				values: {
					show: true,
					format: (_value: number, _number: unknown, context: { series?: string }) => {
						seen.push(context.series);
						return '';
					}
				}
			}
		}) as Ran & { markers: { type: string; text?: (row: Row) => string; data?: Row[] }[] };
		expect(ran.hover.tooltip!.format!(ran.processedData.data[0] as never)).toBe('N=2');
		const labels = ran.markers.find((m) => m.type === 'text' && m.data?.length);
		labels!.text!(labels!.data![0]);
		// Measured ahead of the rows too, with the series alone.
		expect(new Set(seen)).toEqual(new Set(['N']));
	});
});
