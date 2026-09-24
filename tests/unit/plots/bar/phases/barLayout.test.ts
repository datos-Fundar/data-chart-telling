import { describe, test, expect } from 'vitest';
import { buildBarLayout } from '$lib/plots/bar/phases/scales';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { category: string; value: number };

const THEME_MARGINS = {
	top: 20 as const,
	right: 20 as const,
	bottom: 30 as const,
	left: 40 as const
};

function group(name: string, data: Row[]): VisualGroup<Series<Row>, BarSegmentStyle> {
	const series: Series<Row> = { name, x: 'category', y: 'value', data };
	return { series, visualSegments: [{ data, style: {} }] };
}

const A = { category: 'A', value: 10 };
const B = { category: 'B', value: 20 };

function build(overrides: Partial<Parameters<typeof buildBarLayout<Row>>[0]> = {}) {
	return buildBarLayout<Row>({
		scales: {},
		isHorizontal: false,
		width: 400,
		height: 300,
		margins: undefined,
		flat: [A, B],
		xAcc: (d) => d.category,
		groupedSeries: [group('a', [A, B])],
		gapFillMaps: new Map(),
		themeMargins: THEME_MARGINS,
		seriesPaddingDefault: 0.1,
		...overrides
	});
}

describe('buildBarLayout – layout mode', () => {
	test('defaults to overlap when scales.z.seriesLayout is unset', () => {
		expect(build().layout).toBe('overlap');
	});

	test('reads the layout mode off scales.z.seriesLayout', () => {
		expect(build({ scales: { z: { seriesLayout: 'stacked' } } }).layout).toBe('stacked');
		expect(build({ scales: { z: { seriesLayout: 'grouped' } } }).layout).toBe('grouped');
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

describe('buildBarLayout – grouped geometry', () => {
	test('groupOffset/groupInsetFraction are all-zero outside grouped layout', () => {
		const result = build({ scales: { z: { seriesLayout: 'overlap' } } });
		expect(result.groupOffset(0)).toEqual({ dx: 0, dy: 0 });
		expect(result.groupInsetFraction(0)).toEqual({ start: 0, end: 0 });
	});

	test('splits the band evenly across series when grouped', () => {
		const result = build({
			scales: { z: { seriesLayout: 'grouped' } },
			groupedSeries: [group('a', [A]), group('b', [A])]
		});
		const first = result.groupInsetFraction(0);
		const second = result.groupInsetFraction(1);
		// Two equal series slices: each one's own end-inset matches the other's start-inset.
		expect(first.start).toBeCloseTo(second.end, 5);
	});

	test('opposite series get opposite-signed pixel offsets', () => {
		const result = build({
			scales: { z: { seriesLayout: 'grouped' } },
			groupedSeries: [group('a', [A]), group('b', [A])]
		});
		const first = result.groupOffset(0);
		const second = result.groupOffset(1);
		expect(Math.sign(first.dx)).not.toBe(Math.sign(second.dx));
	});
});

describe('buildBarLayout – stacked geometry', () => {
	test('stackedBaseline sums prior series own values at that category', () => {
		const result = build({
			scales: { z: { seriesLayout: 'stacked' } },
			groupedSeries: [group('a', [A]), group('b', [A])],
			flat: [A]
		});
		expect(result.stackedBaseline('A', 0)).toBe(0);
		expect(result.stackedBaseline('A', 1)).toBe(10);
	});

	test('a gap-filled row contributes its filled value instead of being skipped', () => {
		const gapRow = { category: 'A', value: null as unknown as number };
		const gapFillMaps = new Map([
			['a', new Map([[gapRow, { value: 7, kind: 'middle' as const }]])]
		]);
		const result = build({
			scales: { z: { seriesLayout: 'stacked' } },
			groupedSeries: [group('a', [gapRow]), group('b', [A])],
			gapFillMaps,
			flat: [gapRow]
		});
		expect(result.stackedBaseline('A', 1)).toBe(7);
	});

	test('stackedBaseline defaults to 0 for an unknown category', () => {
		expect(build().stackedBaseline('nope', 0)).toBe(0);
	});
});
