import { describe, test, expect } from 'vitest';
import { AuthorMarkers } from '$lib/phases/statistics/AuthorMarkers';
import { SERIES_ID_KEY, SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { RowContext } from '$lib/phases/context/RowContext';
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

describe('withContext', () => {
	/** A row the plot drew, with what it knows of it. */
	const row = { x: 1 };
	RowContext.tag(row as never, { series: 'A', value: 7 });
	const seen = (fn: unknown) => (fn as (row: unknown, index?: number) => unknown)(row, 2);
	const contextOf = (context: Record<string, unknown>) =>
		JSON.stringify(context.row ? { ...context, row: undefined } : context);

	test('gives every function of a row its context, its place among the rows, and what every row shares', () => {
		const echo = (_: unknown, context: Record<string, unknown>) => contextOf(context);
		const marker = AuthorMarkers.withContext(
			{
				type: 'text',
				text: echo,
				src: echo,
				tickLength: echo,
				fit: { fallback: echo, x1: 'x' },
				styles: { fill: echo, fontSize: 12 },
				label: [{ text: echo, dx: echo, styles: { fill: echo } }, { text: 'fixed' }],
				transforms: [{ type: 'filter', filter: echo }]
			},
			{ time: 2003 }
		) as unknown as Record<string, unknown> & {
			fit: Record<string, unknown>;
			styles: Record<string, unknown>;
			label: Record<string, unknown>[];
			transforms: { filter: unknown }[];
		};
		const expected = JSON.stringify({ time: 2003, series: 'A', value: 7, index: 2 });
		for (const fn of [
			marker.text,
			marker.src,
			marker.tickLength,
			marker.fit.fallback,
			marker.styles.fill,
			marker.label[0].text,
			marker.label[0].dx,
			(marker.label[0].styles as Record<string, unknown>).fill,
			marker.transforms[0].filter
		])
			expect(seen(fn)).toBe(expected);
		expect(marker.fit.x1).toBe('x');
		expect(marker.styles.fontSize).toBe(12);
		expect(marker.label[1].text).toBe('fixed');
	});
});
