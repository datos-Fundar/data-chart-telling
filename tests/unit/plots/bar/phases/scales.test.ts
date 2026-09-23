import { describe, test, expect } from 'vitest';
import { buildScales } from '$lib/plots/bar/phases/scales';
import type { Series } from '$lib/types/plots/data/common';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { category: string; value: number };

const PADDING = { inner: 0.2, outer: 0.1 };

function series(data: Row[], name = 'a'): Series<Row> {
	return { name, x: 'category', y: 'value', data };
}

const GROUPED_SERIES: Series<Row>[] = [
	series([
		{ category: 'A', value: 10 },
		{ category: 'B', value: -5 }
	])
];

function build(overrides: Partial<Parameters<typeof buildScales<Row>>[0]> = {}) {
	return buildScales<Row>({
		scales: {},
		resolvedSeries: GROUPED_SERIES,
		categoricalAxis: 'x',
		isHorizontal: false,
		width: 400,
		height: 300,
		padding: PADDING,
		...overrides
	});
}

// ── Categorical sentinel ──────────────────────────────────────────────────────

describe('buildScales – categorical sentinel', () => {
	test('strips the categorical sentinel from the returned scale', () => {
		const result = build({ scales: { x: { type: 'categorical' } } });
		expect(result.x?.type).toBeUndefined();
	});
});

// ── Category axis padding ────────────────────────────────────────────────────

describe('buildScales – category axis padding', () => {
	test('backs paddingInner/paddingOuter with the given defaults when unset', () => {
		const result = build();
		expect(result.x?.paddingInner).toBe(PADDING.inner);
		expect(result.x?.paddingOuter).toBe(PADDING.outer);
	});

	test('an explicit padding shorthand wins over the defaults for both sides', () => {
		const result = build({ scales: { x: { padding: 0.4 } } });
		expect(result.x?.paddingInner).toBe(0.4);
		expect(result.x?.paddingOuter).toBe(0.4);
	});

	test('explicit paddingInner/paddingOuter win over both the shorthand and the defaults', () => {
		const result = build({
			scales: { x: { padding: 0.4, paddingInner: 0.05, paddingOuter: 0.15 } }
		});
		expect(result.x?.paddingInner).toBe(0.05);
		expect(result.x?.paddingOuter).toBe(0.15);
	});

	test('applies padding to y instead when it is the categorical axis', () => {
		const result = build({ categoricalAxis: 'y', isHorizontal: true });
		expect(result.y?.paddingInner).toBe(PADDING.inner);
		expect(result.x?.paddingInner).toBeUndefined();
	});
});

// ── Value axis domain ─────────────────────────────────────────────────────────

describe('buildScales – value axis domain', () => {
	test('nice-widens the value axis from the raw per-row min/max', () => {
		const result = build();
		const [lo, hi] = result.y!.domain as [number, number];
		expect(lo).toBeLessThanOrEqual(-5);
		expect(hi).toBeGreaterThanOrEqual(10);
	});

	test('leaves an explicit domain untouched', () => {
		const result = build({ scales: { y: { domain: [0, 100] } } });
		expect(result.y?.domain).toEqual([0, 100]);
	});

	test('leaves the domain untouched when ticks or nice are set', () => {
		expect(build({ scales: { y: { ticks: [0, 50, 100] } } }).y?.domain).toBeUndefined();
		expect(build({ scales: { y: { nice: false } } }).y?.domain).toBeUndefined();
	});

	test('stacked layout widens the domain from per-category totals, not raw per-row values', () => {
		const stackedSeries: Series<Row>[] = [
			series([{ category: 'A', value: 40 }], 'a'),
			series([{ category: 'A', value: 40 }], 'b')
		];
		const overlap = build({ resolvedSeries: stackedSeries });
		const stacked = build({
			resolvedSeries: stackedSeries,
			scales: { z: { seriesLayout: 'stacked' } }
		});
		const [, overlapHi] = overlap.y!.domain as [number, number];
		const [, stackedHi] = stacked.y!.domain as [number, number];
		// Overlap only ever sees a single row's own value (40); stacked sees
		// the summed category total (80).
		expect(overlapHi).toBeLessThan(stackedHi);
		expect(stackedHi).toBeGreaterThanOrEqual(80);
	});

	test('no series data leaves the value axis without a computed domain', () => {
		expect(build({ resolvedSeries: [] }).y?.domain).toBeUndefined();
	});
});
