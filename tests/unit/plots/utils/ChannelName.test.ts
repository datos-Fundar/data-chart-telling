import { describe, test, expect } from 'vitest';
import { ChannelName } from '$lib/plots/utils/ChannelName';
import { MarkerKinds } from '$lib/markers/MarkerKinds';

describe('ChannelName', () => {
	test("a function's own name is the channel's name", () => {
		const density = (f: unknown) => Number(f);
		expect(ChannelName.of(density, 'color')).toBe('density');
	});

	test('anonymous functions and the property name give none', () => {
		expect(ChannelName.of({ color: (f: unknown) => f }.color, 'color')).toBeUndefined();
		expect(ChannelName.of(() => 1, 'color')).toBeUndefined();
		expect(ChannelName.of('field', 'color')).toBeUndefined();
	});
});

describe('MarkerKinds', () => {
	test('a kind declares its clip, rows, legend symbol, inherited channels and labels traits', () => {
		expect(MarkerKinds.of('area')).toEqual({
			oriented: true,
			inherits: ['x', 'y', 'grouping', 'color', 'opacity'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'area',
			labels: { default: 'point', point: 'top' }
		});
		expect(MarkerKinds.inherits('rule', 'x')).toBe(false);
		expect(MarkerKinds.inheritsScales('dot')).toBe(true);
		expect(MarkerKinds.inheritsScales('text')).toBe(false);
		expect(MarkerKinds.of('dot')?.clip).toBe(false);
		expect(MarkerKinds.of('nope')).toBeUndefined();
	});
});
