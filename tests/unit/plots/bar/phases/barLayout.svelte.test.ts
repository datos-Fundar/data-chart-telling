import { describe, test, expect } from 'vitest';
import { buildBarLayout } from '$lib/plots/bar/phases/scales';
import { buildTransforms } from '$lib/plots/bar/phases/transforms';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { Series } from '$lib/types/plots/data/common';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { category: string; value: number | null };

const THEME_MARGINS = {
	top: 20 as const,
	right: 20 as const,
	bottom: 30 as const,
	left: 40 as const
};

const CTX = { cfg: {} as PlotStylesConfig, legendInteraction: null } as BarPlotCtx;

const A = { category: 'A', value: 10 };
const B = { category: 'B', value: 20 };

const series = (name: string, data: Row[]): Series<Row> => ({
	name,
	x: 'category',
	y: 'value',
	data
});

/** The rows BarPlot's own "transforms" phase leaves for these series - stacked by default. */
function processed(
	list: Series<Row>[],
	gapFillMaps = new Map<string, Map<Row, DiscreteGapFill<BarSegmentStyle>>>(),
	transforms: BarPlotState<Row>['transforms'] = [{ type: 'stackY' }]
) {
	const state = {
		resolvedSeries: list,
		gapFillMaps,
		transforms,
		scales: {},
		width: 400,
		height: 300
	} as BarPlotState<Row>;
	return buildTransforms(state, CTX).processedData;
}

/** One series' rows through the "transforms" phase, with no transforms of its own. */
const unstacked = (rows: Row[]) => processed([series('a', rows)], undefined, []);

function build(overrides: Partial<Parameters<typeof buildBarLayout<Row>>[0]> = {}) {
	return buildBarLayout<Row>({
		scales: {},
		isHorizontal: false,
		width: 400,
		height: 300,
		margins: undefined,
		seriesNames: ['a'],
		processedData: unstacked([A, B]),
		themeMargins: THEME_MARGINS,
		seriesPadding: 0.1,
		...overrides
	});
}

describe('buildBarLayout - layout mode', () => {
	test('series sit side by side when the plot has no stack', () => {
		expect(build().layout).toBe('grouped');
	});

	test('a plot-level stackY stacks them', () => {
		const processedData = processed([series('a', [A]), series('b', [A])]);
		expect(build({ seriesNames: ['a', 'b'], processedData }).layout).toBe('stacked');
	});
});

describe('buildBarLayout - valueBaseline', () => {
	test('is 0 when the value axis has no explicit domain', () => {
		expect(build().valueBaseline).toBe(0);
	});

	test('clamps to the domain bound closest to zero when the domain excludes zero', () => {
		// Vertical bars: the value axis is y.
		expect(build({ scales: { y: { domain: [75, 85] } } }).valueBaseline).toBe(75);
		expect(build({ scales: { y: { domain: [-85, -75] } } }).valueBaseline).toBe(-75);
	});

	test('stays 0 when the domain already straddles zero', () => {
		expect(build({ scales: { y: { domain: [-10, 10] } } }).valueBaseline).toBe(0);
	});

	test('reads the value axis off x instead when isHorizontal', () => {
		const result = build({ isHorizontal: true, scales: { x: { domain: [75, 85] } } });
		expect(result.valueBaseline).toBe(75);
	});
});

describe('buildBarLayout - estimatedBandwidth', () => {
	test('is 0 when there is no data', () => {
		expect(build({ processedData: unstacked([]) }).estimatedBandwidth).toBe(0);
	});

	test('grows the inner size shrinks with fewer categories', () => {
		const twoCategories = build({ processedData: unstacked([A, B]) }).estimatedBandwidth;
		const oneCategory = build({ processedData: unstacked([A]) }).estimatedBandwidth;
		expect(oneCategory).toBeGreaterThan(twoCategories);
	});
});

describe('buildBarLayout - side-by-side geometry', () => {
	test('a lone series fills its whole band', () => {
		const result = build();
		expect(result.groupOffset(0)).toEqual({ dx: 0, dy: 0 });
		expect(result.groupInsetFraction(0)).toEqual({ start: 0, end: 0 });
	});

	test('a stack fills the whole band too', () => {
		const processedData = processed([series('a', [A]), series('b', [A])]);
		const result = build({ seriesNames: ['a', 'b'], processedData });
		expect(result.groupInsetFraction(1)).toEqual({ start: 0, end: 0 });
	});

	test('splits the band evenly across series', () => {
		const result = build({ seriesNames: ['a', 'b'] });
		const first = result.groupInsetFraction(0);
		const second = result.groupInsetFraction(1);
		// Two equal series slices: each one's own end-inset matches the other's start-inset.
		expect(first.start).toBeCloseTo(second.end, 5);
	});

	test('opposite series get opposite-signed pixel offsets', () => {
		const result = build({ seriesNames: ['a', 'b'] });
		expect(Math.sign(result.groupOffset(0).dx)).not.toBe(Math.sign(result.groupOffset(1).dx));
	});
});

describe('buildBarLayout - row geometry', () => {
	test('a stacked series spans from where the prior one ends', () => {
		const processedData = processed([series('a', [A]), series('b', [A])]);
		const layout = build({ seriesNames: ['a', 'b'], processedData });
		expect(processedData!.data.map((row) => layout.spanOf(row))).toEqual([
			[0, 10],
			[10, 20]
		]);
	});

	test('a gap-filled row takes its place in the stack at its filled value', () => {
		const gapRow: Row = { category: 'A', value: null };
		const gapFillMaps = new Map([
			['a', new Map([[gapRow, { value: 7, kind: 'middle' as const, style: {} }]])]
		]);
		const processedData = processed([series('a', [gapRow]), series('b', [A])], gapFillMaps);
		const layout = build({ seriesNames: ['a', 'b'], processedData });
		expect(layout.spanOf(processedData!.data[1])).toEqual([7, 17]);
	});

	test('a grouped bar spans from the value baseline to its value', () => {
		const processedData = unstacked([A]);
		const layout = build({ processedData, scales: { y: { domain: [5, 30] } } });
		expect(layout.spanOf(processedData!.data[0])).toEqual([5, 10]);
	});

	test('a row without a value has no span', () => {
		const processedData = unstacked([{ category: 'C', value: null }]);
		expect(build({ processedData }).spanOf(processedData!.data[0])).toBeUndefined();
	});

	test("reads each row's category", () => {
		const processedData = unstacked([A, B]);
		const layout = build({ processedData });
		expect(processedData!.data.map(layout.categoryOf)).toEqual(['A', 'B']);
	});
});
