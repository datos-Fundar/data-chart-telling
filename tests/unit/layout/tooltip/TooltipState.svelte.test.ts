import { describe, test, expect } from 'vitest';
import { TooltipState } from '$lib/layout/tooltip/TooltipState.svelte';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { ProcessedData } from '$lib/types/phases';
import type { MarkerTransform } from '$lib/types/transforms';
import type { Series } from '$lib/types/plots/data/common';

function processed(
	channels: ProcessedData['channels'],
	transforms: { type: string }[] = []
): ProcessedData {
	return { data: [], channels, options: {}, transforms: transforms as MarkerTransform[] };
}

describe('TooltipState.default', () => {
	const row = { x: 1, y: 2, lo: 2, hi: 5, from: 0, to: 10, n: 4, [SERIES_KEY]: 'A' };

	test('reads `x: y` off the processed channels, under the series when the plot groups', () => {
		const state = { processedData: processed({ x: 'x', y: 'y' }) };
		expect(TooltipState.default(state)(row)).toBe('1: 2');
		const grouped = { ...state, channels: { grouping: { accessor: () => 'A' } } };
		expect(TooltipState.default(grouped)(row)).toBe('A\n1: 2');
	});

	test("a stack's range reads as the row's own share; any other range as its span", () => {
		const stacked = processed({ x: 'x', y1: 'lo', y2: 'hi' }, [{ type: 'stackY' }]);
		expect(TooltipState.default({ processedData: stacked })(row)).toBe('1: 3');
		const binned = processed({ x1: 'from', x2: 'to', y: 'n' }, [{ type: 'binX' }]);
		expect(TooltipState.default({ processedData: binned })(row)).toBe('0-10: 4');
	});

	test("with one band axis, reads `category: value` - the row's own value, as its series reads it", () => {
		const pyramidRow = { cat: '25-29', pos: -12, pct: 12, [SERIES_KEY]: 'A', __seriesId: 'A' };
		const state = {
			processedData: processed({ x: 'pos', y: 'cat' }),
			resolvedSeries: [{ name: 'A', x: 'pct', y: 'cat', data: [] }] as Series<
				Record<string, unknown>
			>[],
			axes: new PlotAxes({ category: 'y', value: 'x', orientation: 'horizontal', bands: ['y'] })
		};
		expect(TooltipState.default(state)(pyramidRow)).toBe('25-29: 12');
	});

	test('a numeric color adds its own line, named by its field', () => {
		const cell = { col: 'A', row: 'X', value: 7 };
		const state = {
			processedData: processed({ x: 'col', y: 'row' }),
			channels: { color: { accessor: (d: never) => (d as typeof cell).value, source: 'value' } },
			axes: new PlotAxes({ orientation: 'vertical', bands: ['x', 'y'] })
		};
		expect(TooltipState.default(state)(cell)).toBe('A: X\nvalue: 7');
	});

	test('formats dates as locale dates', () => {
		const date = new Date(2020, 0, 2);
		expect(TooltipState.value(date)).toBe(date.toLocaleDateString());
	});
});
