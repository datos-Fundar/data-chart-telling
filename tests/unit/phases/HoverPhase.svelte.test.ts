import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { HoverSettings } from '$lib/layout/hover/HoverSettings';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildLineDefaults } from '$lib/plots/line/defaults';
import { buildBarDefaults } from '$lib/plots/bar/defaults';
import { buildHeatmapDefaults } from '$lib/plots/heatmap/defaults';
import { buildPyramidDefaults } from '$lib/plots/pyramid/defaults';
import { buildHistogramDefaults } from '$lib/plots/histogram/defaults';
import { buildScatterDefaults } from '$lib/plots/scatter/defaults';
import type { HoverPoint } from '$lib/types/layout/hover';
import type { AxisPlotDefaults } from '$lib/types/phases';

type Row = Record<string, unknown>;

/** A kind's hover candidates, from running its whole pipeline over `props`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hoverOf(kind: AxisPlotDefaults<any, any>, props: Row, legend: LegendState | null = null) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend });
	const state = Pipeline.ofAxisKind(kind).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as { hover: { points: HoverPoint<Row>[]; strategy: string }; hoverRows: Row[] };
	return state;
}

const RANGE = { mode: 'filter', disabledStyle: {} } as const;

describe('HoverPhase - which rows can be hovered', () => {
	test('a row with no value is never a candidate', () => {
		const data = [
			{ x: 1, y: 2 },
			{ x: 2, y: null },
			{ x: 3, y: 4 }
		];
		const { hover, hoverRows } = hoverOf(buildLineDefaults<Row>(), { data, x: 'x', y: 'y' });
		expect(hover.points.map((p) => p.x)).toEqual([1, 3]);
		expect(hoverRows).toHaveLength(3);
	});

	test('a bar whose gap `styles.gaps` fills is drawn, but not hoverable, like an unfilled one', () => {
		const data = [
			{ c: 'A', v: 1 },
			{ c: 'B', v: null },
			{ c: 'C', v: 3 }
		];
		const gaps = { default: { middle: {} } };
		const filled = hoverOf(buildBarDefaults<Row>(), {
			data,
			x: 'c',
			y: 'v',
			styles: { gaps },
			gaps
		});
		expect(filled.hover.points.map((p) => p.x)).toEqual(['A', 'C']);
		const unfilled = hoverOf(buildBarDefaults<Row>(), { data, x: 'c', y: 'v' });
		expect(unfilled.hover.points.map((p) => p.x)).toEqual(['A', 'C']);
	});

	test('a series the legend turned off is left out', () => {
		const legend = new LegendState();
		legend.turnOff('b', { mode: 'dim' });
		const data = [
			{ x: 1, y: 1, g: 'a' },
			{ x: 1, y: 2, g: 'b' }
		];
		const { hover } = hoverOf(
			buildLineDefaults<Row>(),
			{ data, x: 'x', y: 'y', color: 'g' },
			legend
		);
		expect(hover.points.map((p) => p.series)).toEqual(['a']);
	});

	test('while the legend narrows a continuous color, a row outside its range is left out', () => {
		const data = [
			{ a: 'p', b: 'q', v: 1 },
			{ a: 'p', b: 'r', v: 5 },
			{ a: 'p', b: 's', v: 9 }
		];
		const props = { data, x: 'a', y: 'b', color: 'v' };
		expect(hoverOf(buildHeatmapDefaults<Row>(), props).hover.points).toHaveLength(3);
		const legend = new LegendState();
		legend.range = { min: 4, max: 6, ...RANGE };
		const { hover } = hoverOf(buildHeatmapDefaults<Row>(), props, legend);
		expect(hover.points.map((p) => p.row.v)).toEqual([5]);
	});
});

describe('HoverPhase - where a candidate sits', () => {
	test('a heatmap cell sits at its two categories, with no series or color of its own', () => {
		const data = [{ a: 'p', b: 'q', v: 3 }];
		const { hover } = hoverOf(buildHeatmapDefaults<Row>(), { data, x: 'a', y: 'b', color: 'v' });
		expect(hover.strategy).toBe('punctual');
		expect(hover.points[0]).toMatchObject({ x: 'p', y: 'q', label: '3' });
		expect(hover.points[0].series).toBeUndefined();
		expect(hover.points[0].color).toBeUndefined();
	});

	test('a grouped bar carries its slice of the band', () => {
		const data = [
			{ c: 'A', v: 1, g: 'a' },
			{ c: 'A', v: 2, g: 'b' }
		];
		const { hover } = hoverOf(buildBarDefaults<Row>(), { data, x: 'c', y: 'v', color: 'g' });
		const [first, second] = hover.points;
		expect(first.areaInset!.start).toBeLessThan(second.areaInset!.start);
		expect(first.areaInset!.end).toBeGreaterThan(second.areaInset!.end);
	});

	test('a pyramid bar sits at its signed magnitude, mirrored per side, on either orientation', () => {
		const data = [
			{ age: '0-4', pct: 5, sex: 'F' },
			{ age: '0-4', pct: 6, sex: 'M' }
		];
		const horizontal = hoverOf(buildPyramidDefaults<Row>(), {
			data,
			x: 'pct',
			y: 'age',
			color: 'sex'
		});
		expect(horizontal.hover.strategy).toBe('y');
		expect(horizontal.hover.points.map((p) => [p.x, p.y, p.label])).toEqual([
			[-5, '0-4', '5'],
			[6, '0-4', '6']
		]);
		const vertical = hoverOf(buildPyramidDefaults<Row>(), {
			data,
			x: 'age',
			y: 'pct',
			color: 'sex'
		});
		expect(vertical.hover.strategy).toBe('x');
		expect(vertical.hover.points.map((p) => [p.x, p.y])).toEqual([
			['0-4', -5],
			['0-4', 6]
		]);
	});

	test('a pyramid gap row is never a candidate', () => {
		const data = [
			{ age: '0-4', pct: 5, sex: 'F' },
			{ age: '5-9', pct: null, sex: 'F' }
		];
		const { hover } = hoverOf(buildPyramidDefaults<Row>(), {
			data,
			x: 'pct',
			y: 'age',
			color: 'sex'
		});
		expect(hover.points.map((p) => p.y)).toEqual(['0-4']);
	});

	test('a histogram bin reads as its row plus its count and edges', () => {
		const data = [{ v: 1 }, { v: 2 }, { v: 12 }];
		const props = { data, x: 'v', transforms: [{ type: 'binX', thresholds: [0, 10, 20] }] };
		const { hover } = hoverOf(buildHistogramDefaults<Row>(), props);
		expect(hover.strategy).toBe('x');
		expect(hover.points.map((p) => [p.label, p.row.from, p.row.to])).toEqual([
			['2', 1, 10],
			['1', 10, 12]
		]);
		const horizontal = hoverOf(buildHistogramDefaults<Row>(), {
			data,
			y: 'v',
			transforms: [{ type: 'binY', thresholds: [0, 10, 20] }]
		});
		expect(horizontal.hover.strategy).toBe('y');
	});
});

describe('HoverSettings.strategyOf', () => {
	const axes = (series: { x?: string; y?: string; data: Row[] }[], discrete?: 0 | 1 | 2) =>
		PlotAxes.build({ series, discrete });
	const rows = [{ a: 'p', n: 1, m: 2 }];

	test('runs along the axis that is not measured', () => {
		expect(HoverSettings.strategyOf(axes([{ x: 'n', y: 'm', data: rows }]))).toBe('x');
		expect(HoverSettings.strategyOf(axes([{ x: 'a', y: 'n', data: rows }], 1))).toBe('x');
		expect(HoverSettings.strategyOf(axes([{ x: 'n', y: 'a', data: rows }], 1))).toBe('y');
	});

	test('is exact when both axes hold categories, and x without axes', () => {
		expect(HoverSettings.strategyOf(axes([{ x: 'a', y: 'a', data: rows }], 2))).toBe('punctual');
		expect(HoverSettings.strategyOf(undefined)).toBe('x');
	});

	test('a kind declares its own only when the axes cannot say it (a scatter)', () => {
		const scatter = Pipeline.ofAxisKind(buildScatterDefaults<Row>());
		expect(scatter.hoverStrategy({ data: rows, x: 'n', y: 'm' })).toBe('punctual');
		const line = Pipeline.ofAxisKind(buildLineDefaults<Row>());
		expect(line.hoverStrategy({ data: rows, x: 'n', y: 'm' })).toBe('x');
	});
});
