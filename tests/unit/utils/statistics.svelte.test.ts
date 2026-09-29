import { describe, test, expect } from 'vitest';
import {
	resolveMovingAverage,
	resolveStatisticMarker,
	resolvePlotStatistics,
	expandMarkerStatistics
} from '$lib/utils/statistics';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

describe('resolveMovingAverage', () => {
	test('keeps one output row per input row, smoothed via svelteplot’s own windowY', () => {
		const data = Array.from({ length: 10 }, (_, i) => ({ x: i, y: i * 2 }));
		const marker = resolveMovingAverage({ data, x: 'x', y: 'y' }, { k: 3 });
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
		const marker = resolveMovingAverage({ data, x: 'x', y: 'y', color: '#ff0000' }, { k: 1 });
		expect(marker.styles?.stroke).toBe('#ff0000');
	});

	test('an explicit styles.stroke overrides the source color', () => {
		const data = [{ x: 0, y: 0 }];
		const marker = resolveMovingAverage(
			{ data, x: 'x', y: 'y', color: '#ff0000' },
			{ k: 1, styles: { stroke: '#00ff00' } }
		);
		expect(marker.styles?.stroke).toBe('#00ff00');
	});
});

describe('resolveStatisticMarker', () => {
	const data = [{ x: 0, y: 0 }];

	test('type: regression resolves to a regression marker', () => {
		const marker = resolveStatisticMarker(
			{ data, x: 'x', y: 'y' },
			{ type: 'regression', confidence: 0.9 }
		);
		expect(marker.type).toBe('regression');
		expect((marker as { confidence?: number }).confidence).toBe(0.9);
	});

	test('type: bollinger resolves to a bollinger marker', () => {
		const marker = resolveStatisticMarker(
			{ data, x: 'x', y: 'y' },
			{ type: 'bollinger', n: 10, k: 3 }
		);
		expect(marker.type).toBe('bollinger');
		expect((marker as { n?: number }).n).toBe(10);
		expect((marker as { k?: number }).k).toBe(3);
	});

	test('type: movingAverage resolves to a line marker', () => {
		const marker = resolveStatisticMarker(
			{ data, x: 'x', y: 'y' },
			{ type: 'movingAverage', k: 1 }
		);
		expect(marker.type).toBe('line');
	});
});

describe('resolvePlotStatistics', () => {
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
		expect(resolvePlotStatistics({ series, statistics: undefined })).toEqual([]);
	});

	test('an entry with no series scope pools every series into one source', () => {
		const markers = resolvePlotStatistics({
			series,
			statistics: [{ type: 'movingAverage', k: 1 }]
		});
		expect(markers).toHaveLength(1);
		expect(markers[0].type).toBe('line');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((markers[0] as any).data).toHaveLength(4);
	});

	test('a named series scope produces one derived marker per listed series', () => {
		const markers = resolvePlotStatistics({
			series,
			statistics: [{ type: 'regression', series: ['A', 'B'] }]
		});
		expect(markers).toHaveLength(2);
		expect(markers.every((m) => m.type === 'regression')).toBe(true);
	});

	test('an unknown series name is silently skipped', () => {
		const markers = resolvePlotStatistics({
			series,
			statistics: [{ type: 'regression', series: ['nope'] }]
		});
		expect(markers).toHaveLength(0);
	});
});

describe('expandMarkerStatistics', () => {
	test('a marker with no .statistics passes through unchanged', () => {
		const markers = [
			{ type: 'dot', data: [{ x: 0, y: 0 }], x: 'x', y: 'y' }
		] satisfies AxisBasedMarkersConfig[];
		expect(expandMarkerStatistics(markers, [])).toEqual(markers);
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
		const result = expandMarkerStatistics(source, []);
		expect(result).toHaveLength(2);
		expect(result[0].type).toBe('dot');
		expect(result[1].type).toBe('line');
	});

	test('omitted marker data falls back to the given fallbackData', () => {
		const source = [
			{ type: 'line', x: 'x', y: 'y', statistics: [{ type: 'bollinger' }] }
		] satisfies AxisBasedMarkersConfig[];
		const fallback = [{ x: 0, y: 0 }];
		const result = expandMarkerStatistics(source, fallback);
		expect(result).toHaveLength(2);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((result[1] as any).data).toBe(fallback);
	});

	test('a non-statable marker kind (e.g. rule) is left untouched even if it happened to carry the field', () => {
		const markers = [{ type: 'rule', axis: 'x', value: 0 }] satisfies AxisBasedMarkersConfig[];
		expect(expandMarkerStatistics(markers, [])).toEqual(markers);
	});
});
