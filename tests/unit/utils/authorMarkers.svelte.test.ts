import { describe, test, expect } from 'vitest';
import { prepareAuthorMarkers } from '$lib/utils/authorMarkers';

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
