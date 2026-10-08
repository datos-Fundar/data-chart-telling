import { describe, test, expect } from 'vitest';
import { matchByStrategy } from '$lib/layout/tooltip/utils';
import type { HoverPoint, HoverStore } from '$lib/types/layout/tooltip';

type Row = { label: string };

function point(x: string, y: number, series: string): HoverPoint<Row> {
	return { x, y, label: `${x}/${series}`, series, row: { label: `${x}/${series}` } };
}

function hover(overrides: Partial<HoverStore>): HoverStore {
	return {
		activeX: null,
		activeY: null,
		activeSeries: null,
		cursorFrac: null,
		source: null,
		strategy: 'series',
		sync: true,
		...overrides
	};
}

describe('matchByStrategy - series', () => {
	// Same category, different x/y - only the series ties them together.
	const points = [point('Buenos Aires', 10, 'Varón'), point('Buenos Aires', 8, 'Mujer')];

	test('matches every point sharing the active series, regardless of x/y', () => {
		const result = matchByStrategy(points, hover({ activeSeries: 'Varón' }));
		expect(result).toEqual([points[0]]);
	});

	test('matches all points of the series even when x/y differ from any of them', () => {
		const result = matchByStrategy(
			points,
			hover({ activeSeries: 'Mujer', activeX: 'Córdoba', activeY: 999 })
		);
		expect(result).toEqual([points[1]]);
	});

	test('returns nothing when no series is active', () => {
		expect(matchByStrategy(points, hover({ activeSeries: null }))).toEqual([]);
	});

	test('returns nothing when the active series has no match in this facet', () => {
		expect(matchByStrategy(points, hover({ activeSeries: 'Non-binario' }))).toEqual([]);
	});
});
