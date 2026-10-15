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
	test('a kind declares its clip, rows and legend symbol traits', () => {
		expect(MarkerKinds.of('area')).toEqual({ clip: true, drawsRows: true, legendSymbol: 'area' });
		expect(MarkerKinds.of('dot')?.clip).toBe(false);
		expect(MarkerKinds.of('nope')).toBeUndefined();
	});
});
