import { describe, test, expect } from 'vitest';
import { resolveChannelFill } from '$lib/markers/resolveChannelFill';
import type { ChartConfig } from '$lib/types/configuration/styling';

const testConfig = {
	continuous: { min: 0, max: 1 }
} as unknown as ChartConfig;

describe('resolveChannelFill', () => {
	test('returns undefined when color is unset', () => {
		const data = [{ x: 1, y: 2 }];
		const result = resolveChannelFill(data, undefined, undefined, testConfig as ChartConfig);
		expect(result).toBeUndefined();
	});

	test('returns undefined when all values are non-finite', () => {
		const data = [{ x: NaN }, { x: Infinity }];
		const result = resolveChannelFill(
			data,
			(d) => (d as Record<string, unknown>).x,
			undefined,
			testConfig as ChartConfig
		);
		expect(result).toBeUndefined();
	});

	test('builds a color scale from numeric color accessor + scales.color.scheme', () => {
		const data = [{ val: 0 }, { val: 5 }, { val: 10 }];
		const fill = resolveChannelFill(
			data,
			(d) => (d as Record<string, unknown>).val,
			{ color: { scheme: ['#ffffff', '#000000'] } },
			testConfig as ChartConfig
		);
		expect(fill).toBeDefined();
		// Should produce valid CSS color strings (can be hex or rgb format)
		const color0 = fill!(data[0]);
		const color2 = fill!(data[2]);
		expect(color0).toMatch(/^(rgb\(|#)/);
		expect(color2).toMatch(/^(rgb\(|#)/);
	});

	test('handles string field key accessor', () => {
		const data = [{ value: 1 }, { value: 2 }];
		const fill = resolveChannelFill(
			data,
			'value',
			{ color: { scheme: ['#f00', '#00f'] } },
			testConfig as ChartConfig
		);
		expect(fill).toBeDefined();
		const color = fill!(data[0]);
		expect(color).toMatch(/^(rgb\(|#)/);
	});

	test('builds a categorical color scale from a string-returning accessor', () => {
		const data = [
			{ close: 10, open: 5 },
			{ close: 5, open: 10 }
		];
		const fill = resolveChannelFill(
			data,
			(d) =>
				(d as { close: number; open: number }).close >= (d as { open: number }).open
					? 'up'
					: 'down',
			{ color: { domain: ['up', 'down'], scheme: { up: '#16a34a', down: '#dc2626' } } },
			testConfig as ChartConfig
		);
		expect(fill).toBeDefined();
		expect(fill!(data[0])).toBe('#16a34a');
		expect(fill!(data[1])).toBe('#dc2626');
	});
});
