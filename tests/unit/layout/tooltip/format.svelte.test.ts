import { describe, test, expect } from 'vitest';
import { buildChannelTooltipFormat, formatValue } from '$lib/layout/tooltip/format';
import { SERIES_KEY } from '$lib/layout/phases/transforms';
import type { ProcessedData } from '$lib/types/layout/phases';
import type { MarkerTransform } from '$lib/types/transforms';

function processed(
	channels: ProcessedData['channels'],
	transforms: { type: string }[] = []
): ProcessedData {
	return { data: [], channels, options: {}, transforms: transforms as MarkerTransform[] };
}

describe('buildChannelTooltipFormat', () => {
	const row = { x: 1, y: 2, lo: 2, hi: 5, from: 0, to: 10, n: 4, [SERIES_KEY]: 'A' };

	test('reads `x: y` off the processed channels, under the series when the plot groups', () => {
		const state = { processedData: processed({ x: 'x', y: 'y' }) };
		expect(buildChannelTooltipFormat(state)(row)).toBe('1: 2');
		const grouped = { ...state, channels: { grouping: { accessor: () => 'A' } } };
		expect(buildChannelTooltipFormat(grouped)(row)).toBe('A\n1: 2');
		expect(buildChannelTooltipFormat(grouped, { series: false, separator: ', ' })(row)).toBe(
			'1, 2'
		);
	});

	test("a stack's range reads as the row's own share; any other range as its span", () => {
		const stacked = processed({ x: 'x', y1: 'lo', y2: 'hi' }, [{ type: 'stackY' }]);
		expect(buildChannelTooltipFormat({ processedData: stacked })(row)).toBe('1: 3');
		const binned = processed({ x1: 'from', x2: 'to', y: 'n' }, [{ type: 'binX' }]);
		expect(buildChannelTooltipFormat({ processedData: binned })(row)).toBe('0-10: 4');
	});

	test('formats dates as locale dates', () => {
		const date = new Date(2020, 0, 2);
		expect(formatValue(date)).toBe(date.toLocaleDateString());
	});
});
