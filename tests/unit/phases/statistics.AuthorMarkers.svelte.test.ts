import { describe, test, expect } from 'vitest';
import { AuthorMarkers } from '$lib/phases/statistics/AuthorMarkers';
import { SERIES_ID_KEY, SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import type { ProcessedData } from '$lib/types/phases';

const rows = [
	{ x: 1, y: 2, g: 'A' },
	{ x: 2, y: 4, g: 'A' },
	{ x: 1, y: 3, g: 'B' }
];

describe('prepareAuthorMarkers', () => {
	test('an unscoped marker inherits the plot grouping, then runs its transforms over the plot rows', () => {
		const [marker] = AuthorMarkers.prepare(
			[{ type: 'area', x: 'x', y: 'y', transforms: [{ type: 'stackY' }] }],
			{ grouping: 'g', flat: rows }
		) as unknown as [{ grouping: string; data: unknown[]; y1: unknown }];
		expect(marker.grouping).toBe('g');
		expect(marker.data).toHaveLength(rows.length);
		expect(marker.y1).toBeDefined();
	});

	test('a scoped marker runs its transforms over its own series rows only', () => {
		const [marker] = AuthorMarkers.prepare(
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

describe('prepareAuthorMarkers - scope', () => {
	const series = [{ name: 'A', data: rows.filter((r) => r.g === 'A') }];
	const scopedGroups = [
		{
			name: 'A',
			data: series[0].data,
			color: '#000',
			segments: [
				{ match: (r: Record<string, unknown>) => Number(r.x) <= 1, color: '#111' },
				{ match: (r: Record<string, unknown>) => Number(r.x) >= 2, color: '#222' }
			]
		}
	];

	test('a segment-scoped marker draws once per segment, over its rows and in its color', () => {
		const markers = AuthorMarkers.prepare(
			[
				{
					type: 'dot',
					series: 'A',
					scope: 'segment',
					x: 'x',
					y: 'y',
					transforms: [{ type: 'selectMaxY' }]
				}
			],
			{ flat: rows, resolvedSeries: series, scopedGroups }
		) as unknown as { data: { x: number }[]; styles: { dotFill: string } }[];
		expect(markers.map((m) => m.data.map((r) => r.x))).toEqual([[1], [2]]);
		expect(markers.map((m) => m.styles.dotFill)).toEqual(['#111', '#222']);
	});

	test('a series-scoped marker stays whole despite the series having segments', () => {
		const markers = AuthorMarkers.prepare(
			[{ type: 'dot', series: 'A', x: 'x', y: 'y', transforms: [{ type: 'selectMaxY' }] }],
			{ flat: rows, resolvedSeries: series, scopedGroups }
		) as unknown as { data: { y: number }[] }[];
		expect(markers).toHaveLength(1);
		expect(markers[0].data.map((r) => r.y)).toEqual([4]);
	});
});

describe('withProcessedRows', () => {
	const processed: ProcessedData = {
		data: [
			{ x: 1, y: 2, smooth: 3, [SERIES_KEY]: 'A', [SERIES_ID_KEY]: 'A' },
			{ x: 1, y: 5, smooth: 4, [SERIES_KEY]: 'B', [SERIES_ID_KEY]: 'B' }
		],
		channels: { x: 'x', y: 'smooth' },
		options: {},
		transforms: [{ type: 'windowY', k: 2 }]
	};

	test('a marker without data draws the processed rows and channels, per series', () => {
		const marker = AuthorMarkers.withProcessedRows(
			{ type: 'dot', transforms: [{ type: 'selectLast' }] },
			processed
		);
		expect(marker).toMatchObject({
			data: processed.data,
			x: 'x',
			y: 'smooth',
			grouping: SERIES_ID_KEY
		});
	});

	test('a channel the marker sets itself is kept, and a series scope narrows the rows', () => {
		const marker = AuthorMarkers.withProcessedRows(
			{ type: 'dot', y: 'y', series: 'B' } as { type: string; y: string; data?: unknown[] },
			processed
		);
		expect(marker.y).toBe('y');
		expect(marker.data).toEqual([processed.data[1]]);
	});

	test('a marker with its own data, a kind that draws no rows, or a plot without transforms is left as is', () => {
		const own = { type: 'dot', data: [] };
		const rule = { type: 'rule' };
		expect(AuthorMarkers.withProcessedRows(own, processed)).toBe(own);
		expect(AuthorMarkers.withProcessedRows(rule, processed)).toBe(rule);
		const marker = { type: 'dot' };
		expect(AuthorMarkers.withProcessedRows(marker, { ...processed, transforms: [] })).toBe(marker);
	});
});
