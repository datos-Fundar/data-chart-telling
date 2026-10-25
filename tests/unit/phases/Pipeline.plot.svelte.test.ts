import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { resolveAccessor } from '$lib/utils/accessors';
import { Pipeline } from '$lib/phases/Pipeline';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import { buildBarDefaults } from '$lib/plots/ranking/bar/defaults';
import { buildPyramidDefaults } from '$lib/plots/distribution/pyramid/defaults';
import { buildHeatmapDefaults } from '$lib/plots/correlation/heatmap/defaults';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisPlotDefaults } from '$lib/types/phases';

type Row = { year: number; age: string; sex: string; pop: number };

/** What a plot reads off its kind's pipeline, given its props: its hover strategy, its timeline tween and its data run. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function plotOf(kind: AxisPlotDefaults<any, any>, props: Record<string, unknown>) {
	const pipeline = Pipeline.ofAxisKind(kind);
	return {
		hoverStrategy: pipeline.hoverStrategy(props),
		timeline: { interpolation: pipeline.interpolation<Row>(props, DEFAULT_CONFIG) },
		dataRun: (rows: Row[], facet: FacetConfig<Row> | undefined, legend: null) =>
			pipeline.runData(props, rows, facet as never, legend, DEFAULT_CONFIG)
	};
}

const ROWS: Row[] = [
	{ year: 2000, age: '0-4', sex: 'F', pop: 10 },
	{ year: 2000, age: '0-4', sex: 'M', pop: 12 },
	{ year: 2000, age: '5-9', sex: 'F', pop: 8 },
	{ year: 2010, age: '0-4', sex: 'F', pop: 15 }
];

describe('timeline interpolation, resolved by the "mapping" phase', () => {
	test("a line tweens its `y`, matched per series, and only once there's `data` and a `y`", () => {
		const { timeline } = plotOf(buildLineDefaults<Row>(), {
			data: ROWS,
			x: 'year',
			y: 'pop',
			color: 'sex'
		});
		expect(timeline?.interpolation).toEqual({ value: 'pop', key: 'sex' });
		expect(
			plotOf(buildLineDefaults<Row>(), { x: 'year', y: 'pop' }).timeline?.interpolation
		).toBeUndefined();
		expect(
			plotOf(buildLineDefaults<Row>(), { data: ROWS, x: 'year' }).timeline?.interpolation
		).toBeUndefined();
	});

	test('a bar matches by category, and by category and group when grouped', () => {
		const ungrouped = plotOf(buildBarDefaults<Row>(), { data: ROWS, x: 'age', y: 'pop' });
		expect(ungrouped.timeline?.interpolation).toEqual({ value: 'pop', key: 'age' });
		const grouped = plotOf(buildBarDefaults<Row>(), {
			data: ROWS,
			x: 'age',
			y: 'pop',
			color: 'sex'
		});
		const key = resolveAccessor(grouped.timeline!.interpolation!.key!);
		expect(key(ROWS[1])).toBe('0-4::M');
	});

	test('a pyramid tweens its magnitude (`x` when horizontal), matched by category and side', () => {
		const { timeline } = plotOf(buildPyramidDefaults<Row>(), {
			data: ROWS,
			x: 'pop',
			y: 'age',
			color: 'sex'
		});
		expect(timeline?.interpolation?.value).toBe('pop');
		expect(resolveAccessor(timeline!.interpolation!.key!)(ROWS[2])).toBe('5-9::F');
	});
});

/** A plot's shared scales over `ROWS`, left by its own data run: a lookup by facet panel (`''` without one). */
function sharedOver(plot: ReturnType<typeof plotOf>, facet?: FacetConfig<Row>) {
	const shared = (plot.dataRun(ROWS, facet, null).sharedScales ?? {}) as Record<
		string,
		AxisBasedScalesConfig<Row>
	>;
	return (panel = '') => shared[panel];
}

describe('shared scales, from the "scales" phase', () => {
	test('a pyramid shares its diverging magnitude axis and every category', () => {
		const pyramid = plotOf(buildPyramidDefaults<Row>(), { x: 'pop', y: 'age', color: 'sex' });
		expect(sharedOver(pyramid)()).toEqual({
			x: { domain: [-15, 15] },
			y: { domain: ['0-4', '5-9'] }
		});
	});

	test("a pyramid's facet panels follow `facet.scales`", () => {
		const pyramid = plotOf(buildPyramidDefaults<Row>(), { x: 'pop', y: 'age', color: 'sex' });
		expect(sharedOver(pyramid, { by: 'year' })('2000')).toEqual({
			x: { domain: [-15, 15] },
			y: { domain: ['0-4', '5-9'] }
		});
		expect(sharedOver(pyramid, { by: 'year', scales: 'free' })('2000')).toBeUndefined();
		expect(sharedOver(pyramid, { by: 'year', scales: 'free-y' })('2000')).toEqual({
			x: { domain: [-15, 15] }
		});
	});

	test('a heatmap shares its color domain, from zero, only when it has a `color`', () => {
		const colored = plotOf(buildHeatmapDefaults<Row>(), { x: 'year', y: 'age', color: 'pop' });
		expect(sharedOver(colored)()?.color).toEqual({ domain: [0, 15] });
		const plain = plotOf(buildHeatmapDefaults<Row>(), { x: 'year', y: 'age' });
		expect(sharedOver(plain)()?.color).toBeUndefined();
	});
});

test('a bar hovers along whichever axis carries its categories', () => {
	const vertical = plotOf(buildBarDefaults<Row>(), { data: ROWS, x: 'age', y: 'pop' });
	const horizontal = plotOf(buildBarDefaults<Row>(), { data: ROWS, x: 'pop', y: 'age' });
	const numeric = plotOf(buildBarDefaults<Row>(), {
		data: ROWS,
		x: 'pop',
		y: 'year',
		scales: { y: { type: 'band' } }
	});
	expect([vertical.hoverStrategy, horizontal.hoverStrategy, numeric.hoverStrategy]).toEqual([
		'x',
		'y',
		'y'
	]);
});
