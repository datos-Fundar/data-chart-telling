import { describe, test, expect, vi, afterEach } from 'vitest';
import { buildMapping } from '$lib/plots/bar/phases/mapping';
import type { Series } from '$lib/types/plots/data/common';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { category: string; value: number };

const SERIES: Series<Row>[] = [
	{
		name: 'a',
		x: 'category',
		y: 'value',
		data: [
			{ category: 'A', value: 10 },
			{ category: 'B', value: -5 }
		]
	}
];

afterEach(() => vi.restoreAllMocks());

describe('buildMapping – category axis', () => {
	test('defaults to x when neither axis is marked categorical', () => {
		const result = buildMapping({ scales: {}, resolvedSeries: SERIES });
		expect(result.categoricalAxis).toBe('x');
		expect(result.isHorizontal).toBe(false);
	});

	test('marks y as horizontal when scales.y.type is categorical', () => {
		const result = buildMapping({
			scales: { y: { type: 'categorical' } },
			resolvedSeries: SERIES
		});
		expect(result.categoricalAxis).toBe('y');
		expect(result.isHorizontal).toBe(true);
	});

	test('warns and defaults to x when both axes are marked categorical', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const result = buildMapping({
			scales: { x: { type: 'categorical' }, y: { type: 'categorical' } },
			resolvedSeries: SERIES
		});
		expect(result.categoricalAxis).toBe('x');
		expect(warn).toHaveBeenCalledOnce();
	});
});

describe('buildMapping – channels', () => {
	test('resolves each channel to the first series own x/y accessor', () => {
		const result = buildMapping({ scales: {}, resolvedSeries: SERIES });
		expect(result.channels.x.accessor(SERIES[0].data[0])).toBe('A');
		expect(result.channels.y.accessor(SERIES[0].data[0])).toBe(10);
	});
});
