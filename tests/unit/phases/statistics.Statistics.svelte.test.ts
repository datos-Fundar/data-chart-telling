import { describe, test, expect } from 'vitest';
import { MovingAverageStatistic } from '$lib/phases/statistics/methods/MovingAverageStatistic';
import { Statistics } from '$lib/phases/statistics/Statistics';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

describe('MovingAverageStatistic.build', () => {
	test('keeps one output row per input row, smoothed via svelteplot’s own windowY', () => {
		const data = Array.from({ length: 10 }, (_, i) => ({ x: i, y: i * 2 }));
		const marker = MovingAverageStatistic.build({ data, x: 'x', y: 'y' }, { k: 3 });
		expect(marker.type).toBe('line');
		expect(marker.data).toHaveLength(10);
		const yFn =
			typeof marker.y === 'function'
				? marker.y
				: (d: Record<string, unknown>) => d[marker.y as string];
		// Window k=3, anchor 'middle' (svelteplot's own default): index 1's window is [0,2,4] -> mean 2.
		expect(yFn(marker.data![1])).toBe(2);
	});

	test('falls back to the source color when styles.stroke is unset', () => {
		const data = [{ x: 0, y: 0 }];
		const marker = MovingAverageStatistic.build({ data, x: 'x', y: 'y', color: '#ff0000' }, { k: 1 });
		expect(marker.styles?.stroke).toBe('#ff0000');
	});

	test('an explicit styles.stroke overrides the source color', () => {
		const data = [{ x: 0, y: 0 }];
		const marker = MovingAverageStatistic.build(
			{ data, x: 'x', y: 'y', color: '#ff0000' },
			{ k: 1, styles: { stroke: '#00ff00' } }
		);
		expect(marker.styles?.stroke).toBe('#00ff00');
	});
});

describe('Statistics.buildMarker', () => {
	const data = [{ x: 0, y: 0 }];

	test('type: regression resolves to a regression marker', () => {
		const marker = Statistics.buildMarker(
			{ data, x: 'x', y: 'y' },
			{ type: 'regression', confidence: 0.9 }
		);
		expect(marker.type).toBe('regression');
		expect((marker as { confidence?: number }).confidence).toBe(0.9);
	});

	test('type: bollinger resolves to a bollinger marker', () => {
		const marker = Statistics.buildMarker(
			{ data, x: 'x', y: 'y' },
			{ type: 'bollinger', n: 10, k: 3 }
		);
		expect(marker.type).toBe('bollinger');
		expect((marker as { n?: number }).n).toBe(10);
		expect((marker as { k?: number }).k).toBe(3);
	});

	test('type: movingAverage resolves to a line marker', () => {
		const marker = Statistics.buildMarker(
			{ data, x: 'x', y: 'y' },
			{ type: 'movingAverage', k: 1 }
		);
		expect(marker.type).toBe('line');
	});
});

describe('Statistics.buildForPlot', () => {
	const series: Series<{ x: number; y: number }>[] = [
		{
			name: 'A',
			x: 'x',
			y: 'y',
			data: [
				{ x: 0, y: 0 },
				{ x: 1, y: 2 }
			]
		},
		{
			name: 'B',
			x: 'x',
			y: 'y',
			data: [
				{ x: 0, y: 10 },
				{ x: 1, y: 12 }
			]
		}
	];

	test('returns nothing when statistics is unset', () => {
		expect(Statistics.buildForPlot({ series, statistics: undefined })).toEqual([]);
	});

	test('an entry with no series scope derives one statistic per series by default', () => {
		const markers = Statistics.buildForPlot({
			series,
			statistics: [{ type: 'movingAverage', k: 1 }]
		});
		expect(markers).toHaveLength(series.length);
	});

	test('pooled: true derives one statistic over every series combined', () => {
		const markers = Statistics.buildForPlot({
			series,
			statistics: [{ type: 'movingAverage', k: 1, pooled: true }]
		});
		expect(markers).toHaveLength(1);
		expect(markers[0].type).toBe('line');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((markers[0] as any).data).toHaveLength(4);
	});

	test('a named series scope produces one derived marker per listed series', () => {
		const markers = Statistics.buildForPlot({
			series,
			statistics: [{ type: 'regression', series: ['A', 'B'] }]
		});
		expect(markers).toHaveLength(2);
		expect(markers.every((m) => m.type === 'regression')).toBe(true);
	});

	test('an unknown series name is silently skipped', () => {
		const markers = Statistics.buildForPlot({
			series,
			statistics: [{ type: 'regression', series: ['nope'] }]
		});
		expect(markers).toHaveLength(0);
	});
});

describe('Statistics.expandMarkers', () => {
	test('a marker with no .statistics passes through unchanged', () => {
		const markers = [
			{ type: 'dot', data: [{ x: 0, y: 0 }], x: 'x', y: 'y' }
		] satisfies AxisBasedMarkersConfig[];
		expect(Statistics.expandMarkers(markers, [])).toEqual(markers);
	});

	test('a statable marker with .statistics gets its derived marker spliced in right after it', () => {
		const source = [
			{
				type: 'dot',
				data: [
					{ x: 0, y: 0 },
					{ x: 1, y: 2 }
				],
				x: 'x',
				y: 'y',
				statistics: [{ type: 'movingAverage', k: 1 }]
			}
		] satisfies AxisBasedMarkersConfig[];
		const result = Statistics.expandMarkers(source, []);
		expect(result).toHaveLength(2);
		expect(result[0].type).toBe('dot');
		expect(result[1].type).toBe('line');
	});

	test('omitted marker data falls back to the given fallbackData', () => {
		const source = [
			{ type: 'line', x: 'x', y: 'y', statistics: [{ type: 'bollinger' }] }
		] satisfies AxisBasedMarkersConfig[];
		const fallback = [{ x: 0, y: 0 }];
		const result = Statistics.expandMarkers(source, fallback);
		expect(result).toHaveLength(2);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((result[1] as any).data).toBe(fallback);
	});

	test('a non-statable marker kind (e.g. rule) is left untouched even if it happened to carry the field', () => {
		const markers = [{ type: 'rule', axis: 'x', value: 0 }] satisfies AxisBasedMarkersConfig[];
		expect(Statistics.expandMarkers(markers, [])).toEqual(markers);
	});
});

describe('density and box statistics', () => {
	const data = Array.from({ length: 20 }, (_, i) => ({ x: i % 5, y: i }));

	test('type: density resolves to an area marker over svelteplot’s densityX output', () => {
		const marker = Statistics.buildMarker(
			{ data, x: 'x', y: 'y', color: '#ff0000' },
			{ type: 'density', bandwidth: 1 }
		);
		expect(marker.type).toBe('area');
		expect((marker as { data?: unknown[] }).data!.length).toBeGreaterThan(0);
		expect((marker as { styles?: { fill?: string } }).styles?.fill).toBe('#ff0000');
	});

	test('type: density2d resolves to a density marker with the same bandwidth', () => {
		const marker = Statistics.buildMarker(
			{ data, x: 'x', y: 'y' },
			{ type: 'density2d', bandwidth: 15 }
		);
		expect(marker.type).toBe('density');
		expect((marker as { bandwidth?: number }).bandwidth).toBe(15);
	});

	test('type: box resolves to a box marker, bar filled with the source color by default', () => {
		const marker = Statistics.buildMarker(
			{ data, x: 'x', y: 'y', color: '#00ff00' },
			{ type: 'box', tickMedian: false }
		);
		expect(marker.type).toBe('box');
		expect((marker as { bar?: { fill?: string } }).bar?.fill).toBe('#00ff00');
		expect((marker as { tickMedian?: boolean }).tickMedian).toBe(false);
	});

	test('type: box does not leak the plot-level series scope into the marker', () => {
		const marker = Statistics.buildMarker({ data, x: 'x', y: 'y' }, { type: 'box', series: ['A'] });
		expect(marker).not.toHaveProperty('series');
	});
});

describe('statistic color inheritance', () => {
	const data = Array.from({ length: 6 }, (_, i) => ({ x: i, y: i * 2, g: i % 2 ? 'A' : 'B' }));

	test('a plot-level statistic inherits its series color', () => {
		const markers = Statistics.buildForPlot({
			series: [{ name: 'A', data, x: 'x', y: 'y' } as never],
			statistics: [{ type: 'movingAverage', k: 2 }],
			colorFor: () => '#123456'
		});
		expect((markers[0] as { styles?: { stroke?: string } }).styles?.stroke).toBe('#123456');
	});

	test('a pooled plot-level statistic inherits the default series color', () => {
		const markers = Statistics.buildForPlot({
			series: [
				{ name: 'A', data, x: 'x', y: 'y' } as never,
				{ name: 'B', data, x: 'x', y: 'y' } as never
			],
			statistics: [{ type: 'movingAverage', k: 2, pooled: true }],
			colorFor: () => '#123456'
		});
		expect(markers).toHaveLength(1);
		expect((markers[0] as { styles?: { stroke?: string } }).styles?.stroke).toBe('#123456');
	});

	test('a marker-level statistic inherits the marker’s own flat color', () => {
		const expanded = Statistics.expandMarkers(
			[
				{
					type: 'dot',
					x: 'x',
					y: 'y',
					styles: { dotFill: '#dc2626', dotStroke: '#dc2626' },
					statistics: [{ type: 'movingAverage', k: 2 }]
				}
			] as never,
			data
		);
		expect((expanded[1] as { styles?: { stroke?: string } }).styles?.stroke).toBe('#dc2626');
	});

	test('a grouped marker derives one statistic per group, each in its group’s color', () => {
		const expanded = Statistics.expandMarkers(
			[
				{
					type: 'dot',
					x: 'x',
					y: 'y',
					color: 'g',
					statistics: [{ type: 'movingAverage', k: 2 }]
				}
			] as never,
			data
		);
		const derived = expanded.slice(1) as { styles?: { stroke?: string } }[];
		expect(derived).toHaveLength(2);
		expect(derived.every((m) => typeof m.styles?.stroke === 'string')).toBe(true);
		expect(derived[0].styles?.stroke).not.toBe(derived[1].styles?.stroke);
	});

	test('with no color anywhere, a statistic falls back to black', () => {
		const marker = Statistics.buildMarker({ data, x: 'x', y: 'y' }, { type: 'regression' });
		expect((marker as { styles?: { stroke?: string } }).styles?.stroke).toBe('#000000');
	});
});
