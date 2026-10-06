import { describe, test, expect } from 'vitest';
import { buildBarLayout } from '$lib/plots/bar/phases/scales';
import { buildTransforms } from '$lib/plots/bar/phases/transforms';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';
import type { ChartConfig } from '$lib/types/configuration/styling';
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

const CTX = { cfg: {} as ChartConfig, legendInteraction: null } as BarPlotCtx;

const A = { category: 'A', value: 10 };
const B = { category: 'B', value: 20 };

const series = (name: string, data: Row[]): Series<Row> => ({
	name,
	x: 'category',
	y: 'value',
	data
});

/** The rows a plot-level `stackY` leaves for these series, through BarPlot's own "transforms" phase. */
function stacked(
	list: Series<Row>[],
	gapFillMaps = new Map<string, Map<Row, DiscreteGapFill<BarSegmentStyle>>>()
) {
	const state = {
		resolvedSeries: list,
		gapFillMaps,
		transforms: [{ type: 'stackY' }],
		scales: {},
		width: 400,
		height: 300
	} as BarPlotState<Row>;
	return buildTransforms(state, CTX).processedData;
}

function build(overrides: Partial<Parameters<typeof buildBarLayout<Row>>[0]> = {}) {
	return buildBarLayout<Row>({
		scales: {},
		isHorizontal: false,
		width: 400,
		height: 300,
		margins: undefined,
		flat: [A, B],
		xAcc: (d) => d.category,
		seriesNames: ['a'],
		processedData: undefined,
		themeMargins: THEME_MARGINS,
		seriesPadding: 0.1,
		...overrides
	});
}

describe('buildBarLayout – layout mode', () => {
	test('series sit side by side when the plot has no stack', () => {
		expect(build().layout).toBe('grouped');
	});

	test('a plot-level stackY stacks them', () => {
		const processedData = stacked([series('a', [A]), series('b', [A])]);
		expect(build({ seriesNames: ['a', 'b'], processedData }).layout).toBe('stacked');
	});
});

describe('buildBarLayout – valueBaseline', () => {
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

describe('buildBarLayout – estimatedBandwidth', () => {
	test('is 0 when there is no data', () => {
		expect(build({ flat: [] }).estimatedBandwidth).toBe(0);
	});

	test('grows the inner size shrinks with fewer categories', () => {
		const twoCategories = build({ flat: [A, B] }).estimatedBandwidth;
		const oneCategory = build({ flat: [A] }).estimatedBandwidth;
		expect(oneCategory).toBeGreaterThan(twoCategories);
	});
});

describe('buildBarLayout – side-by-side geometry', () => {
	test('a lone series fills its whole band', () => {
		const result = build();
		expect(result.groupOffset(0)).toEqual({ dx: 0, dy: 0 });
		expect(result.groupInsetFraction(0)).toEqual({ start: 0, end: 0 });
	});

	test('a stack fills the whole band too', () => {
		const processedData = stacked([series('a', [A]), series('b', [A])]);
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

describe('buildBarLayout – stacked geometry', () => {
	test('each series spans from where the prior one ends', () => {
		const processedData = stacked([series('a', [A]), series('b', [A])]);
		const result = build({ seriesNames: ['a', 'b'], processedData, flat: [A] });
		expect(result.stackedSpan('A', 0)).toEqual([0, 10]);
		expect(result.stackedSpan('A', 1)).toEqual([10, 20]);
	});

	test('a gap-filled row takes its place in the stack at its filled value', () => {
		const gapRow: Row = { category: 'A', value: null };
		const gapFillMaps = new Map([
			['a', new Map([[gapRow, { value: 7, kind: 'middle' as const, style: {} }]])]
		]);
		const processedData = stacked([series('a', [gapRow]), series('b', [A])], gapFillMaps);
		const result = build({ seriesNames: ['a', 'b'], processedData, flat: [gapRow] });
		expect(result.stackedSpan('A', 1)).toEqual([7, 17]);
	});

	test('an unknown category has no span', () => {
		const processedData = stacked([series('a', [A])]);
		expect(build({ processedData }).stackedSpan('nope', 0)).toBeUndefined();
	});
});
