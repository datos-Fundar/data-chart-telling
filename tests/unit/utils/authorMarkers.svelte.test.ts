import { describe, test, expect } from 'vitest';
import { prepareAuthorMarkers, withProcessedRows } from '$lib/utils/authorMarkers';
import { SERIES_KEY } from '$lib/layout/phases/transforms';
import type { ProcessedData } from '$lib/types/layout/phases';

const rows = [
	{ x: 1, y: 2, g: 'A' },
	{ x: 2, y: 4, g: 'A' },
	{ x: 1, y: 3, g: 'B' }
];

describe('prepareAuthorMarkers', () => {
	test('an unscoped marker inherits the plot grouping, then runs its transforms over the plot rows', () => {
		const [marker] = prepareAuthorMarkers(
			[{ type: 'area', x: 'x', y: 'y', transforms: [{ type: 'stackY' }] }],
			{ grouping: 'g', flat: rows }
		) as unknown as [{ grouping: string; data: unknown[]; y1: unknown }];
		expect(marker.grouping).toBe('g');
		expect(marker.data).toHaveLength(rows.length);
		expect(marker.y1).toBeDefined();
	});

	test('a scoped marker runs its transforms over its own series rows only', () => {
		const [marker] = prepareAuthorMarkers(
			[{ type: 'area', series: 'A', x: 'x', y: 'y', transforms: [{ type: 'stackY' }] }],
			{
				flat: rows,
				resolvedSeries: [
					{ name: 'A', data: rows.filter((r) => r.g === 'A') },
					{ name: 'B', data: rows.filter((r) => r.g === 'B') }
				]
			}
		) as unknown as [{ data: unknown[] }];
		expect(marker.data).toHaveLength(2);
	});
});

describe('withProcessedRows', () => {
	const processed: ProcessedData = {
		data: [
			{ x: 1, y: 2, smooth: 3, [SERIES_KEY]: 'A' },
			{ x: 1, y: 5, smooth: 4, [SERIES_KEY]: 'B' }
		],
		channels: { x: 'x', y: 'smooth' },
		options: {},
		transforms: [{ type: 'windowY', k: 2 }]
	};

	test('a marker without data draws the processed rows and channels, per series', () => {
		const marker = withProcessedRows(
			{ type: 'dot', transforms: [{ type: 'selectLast' }] },
			processed
		);
		expect(marker).toMatchObject({
			data: processed.data,
			x: 'x',
			y: 'smooth',
			grouping: SERIES_KEY
		});
	});

	test('a channel the marker sets itself is kept, and a series scope narrows the rows', () => {
		const marker = withProcessedRows(
			{ type: 'dot', y: 'y', series: 'B' } as { type: string; y: string; data?: unknown[] },
			processed
		);
		expect(marker.y).toBe('y');
		expect(marker.data).toEqual([processed.data[1]]);
	});

	test('a marker with its own data, a kind that draws no rows, or a plot without transforms is left as is', () => {
		const own = { type: 'dot', data: [] };
		const rule = { type: 'rule' };
		expect(withProcessedRows(own, processed)).toBe(own);
		expect(withProcessedRows(rule, processed)).toBe(rule);
		const marker = { type: 'dot' };
		expect(withProcessedRows(marker, { ...processed, transforms: [] })).toBe(marker);
	});
});
