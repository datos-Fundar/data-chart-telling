import { describe, test, expect } from 'vitest';
import { ColorRamp } from '$lib/utils/color';

describe('ColorRamp.resolve', () => {
	// d3-interpolate's rgb interpolator returns `rgb(r, g, b)` strings, even
	// at the exact endpoints - not the hex the config was given in.
	test('with no config, falls back to the default 2-color scheme over the computed domain', () => {
		const scale = ColorRamp.resolve(undefined, [0, 100], ['#000000', '#ffffff']);
		expect(scale(0)).toBe('rgb(0, 0, 0)');
		expect(scale(100)).toBe('rgb(255, 255, 255)');
	});

	test('an explicit domain wins over the computed one', () => {
		const scale = ColorRamp.resolve({ domain: [0, 10] }, [0, 100], ['#000000', '#ffffff']);
		expect(scale(10)).toBe('rgb(255, 255, 255)');
	});

	test('interpolates smoothly across more than 2 stops', () => {
		const scale = ColorRamp.resolve(
			{ scheme: ['#000000', '#808080', '#ffffff'] },
			[0, 100],
			['#000000', '#ffffff']
		);
		expect(scale(0)).toBe('rgb(0, 0, 0)');
		expect(scale(100)).toBe('rgb(255, 255, 255)');
		// The middle stop should land near the domain's own midpoint.
		expect(scale(50)).not.toBe(scale(0));
		expect(scale(50)).not.toBe(scale(100));
	});

	test('a pivot centers a 3-stop scheme on that domain value instead of the midpoint', () => {
		const scale = ColorRamp.resolve(
			{ scheme: ['#0000ff', '#ffffff', '#ff0000'], pivot: 90 },
			[0, 100],
			['#000000', '#ffffff']
		);
		expect(scale(90)).toBe('rgb(255, 255, 255)');
	});

	test('a Record scheme resolves by direct category lookup', () => {
		const scale = ColorRamp.resolve(
			{ scheme: { a: '#ff0000', b: '#00ff00' } },
			['a', 'b'],
			['#000000', '#ffffff']
		);
		expect(scale('a')).toBe('#ff0000');
		expect(scale('b')).toBe('#00ff00');
		expect(scale('c')).toBe('#ccc');
	});

	test('a categorical domain with an array scheme cycles through it by category index', () => {
		const scale = ColorRamp.resolve(
			{ scheme: ['#ff0000', '#00ff00', '#0000ff'] },
			['a', 'b', 'c'],
			['#000000', '#ffffff']
		);
		expect(scale('a')).toBe('#ff0000');
		expect(scale('c')).toBe('#0000ff');
	});

	test('returns the unknown fallback for a null/undefined value', () => {
		const scale = ColorRamp.resolve({ unknown: '#123456' }, [0, 100], ['#000000', '#ffffff']);
		expect(scale(null)).toBe('#123456');
		expect(scale(undefined)).toBe('#123456');
	});

	test('returns the unknown fallback when there is no domain to resolve against', () => {
		const scale = ColorRamp.resolve(undefined, undefined, ['#000000', '#ffffff']);
		expect(scale(50)).toBe('#ccc');
	});

	test('a named d3-scale-chromatic scheme resolves over the continuous domain', () => {
		const scale = ColorRamp.resolve({ scheme: 'turbo' }, [0, 100], ['#000000', '#ffffff']);
		expect(scale(0)).not.toBe(scale(100));
		expect(scale(0)).not.toBe('#ccc');
	});

	test('a named scheme is case-insensitive', () => {
		const lower = ColorRamp.resolve({ scheme: 'turbo' }, [0, 100], ['#000000', '#ffffff']);
		const mixed = ColorRamp.resolve({ scheme: 'Turbo' }, [0, 100], ['#000000', '#ffffff']);
		expect(mixed(50)).toBe(lower(50));
	});

	test('an unknown scheme name falls back to the unknown color', () => {
		const scale = ColorRamp.resolve(
			{ scheme: 'not-a-real-scheme' },
			[0, 100],
			['#000000', '#ffffff']
		);
		expect(scale(50)).toBe('#ccc');
	});

	test('a named scheme samples evenly across a categorical domain', () => {
		const scale = ColorRamp.resolve({ scheme: 'turbo' }, ['a', 'b', 'c'], ['#000000', '#ffffff']);
		expect(scale('a')).not.toBe(scale('c'));
		expect(scale('z')).toBe('#ccc');
	});

	test('schemeRange uses only a part of a named scheme, in the continuous and the categorical case', () => {
		const full = ColorRamp.resolve({ scheme: 'blues' }, [0, 100], ['#000000', '#ffffff']);
		const trimmed = ColorRamp.resolve(
			{ scheme: 'blues', schemeRange: [0.5, 1] },
			[0, 100],
			['#000000', '#ffffff']
		);
		// The trimmed ramp starts where the full one is halfway, and ends together with it.
		expect(trimmed(0)).toBe(full(50));
		expect(trimmed(100)).toBe(full(100));

		const categories = ColorRamp.resolve(
			{ scheme: 'blues', schemeRange: [0.5, 1] },
			['a', 'b'],
			['#000000', '#ffffff']
		);
		expect(categories('a')).toBe(full(50));
		expect(categories('b')).toBe(full(100));
	});

	test('a pivot works with a named scheme too (not just an explicit array)', () => {
		const scale = ColorRamp.resolve(
			{ scheme: 'rdylbu', pivot: 50 },
			[0, 100],
			['#000000', '#ffffff']
		);
		expect(scale(50)).toBeDefined();
		expect(scale(0)).not.toBe(scale(100));
	});
});

const ends = {
	min: '#000000',
	max: '#ffffff',
	labelColor: '#111',
	opacityRange: [0.2, 1] as [number, number]
};
const rgb = (color: string) => color.match(/\d+/g)!.slice(0, 3).map(Number);

describe('ColorRamp.continuous', () => {
	test('without a scheme the ramp runs from min to max', () => {
		const scale = ColorRamp.continuous({ continuous: ends }, undefined, [0, 10]);
		expect(rgb(scale(0))).toEqual([0, 0, 0]);
		expect(rgb(scale(10))).toEqual([255, 255, 255]);
	});

	test('a named scheme replaces min and max', () => {
		const scale = ColorRamp.continuous(
			{ continuous: { ...ends, scheme: 'blues' } },
			undefined,
			[0, 10]
		);
		expect(rgb(scale(0))).toEqual([247, 251, 255]);
		expect(rgb(scale(10))).toEqual([8, 48, 107]);
	});

	test("the configuration's schemeRange trims its own scheme", () => {
		const cfg = {
			continuous: { ...ends, scheme: 'blues', schemeRange: [0.5, 1] as [number, number] }
		};
		const trimmed = ColorRamp.continuous(cfg, undefined, [0, 10]);
		const full = ColorRamp.continuous(
			{ continuous: { ...ends, scheme: 'blues' } },
			undefined,
			[0, 10]
		);
		expect(trimmed(0)).not.toBe(full(0));
		expect(trimmed(10)).toBe(full(10));
	});

	test("a plot's own scheme wins, with no schemeRange of the configuration's", () => {
		const cfg = {
			continuous: { ...ends, scheme: 'blues', schemeRange: [0.5, 1] as [number, number] }
		};
		const scale = ColorRamp.continuous(cfg, { scheme: ['#ff0000', '#0000ff'] }, [0, 10]);
		expect(rgb(scale(0))).toEqual([255, 0, 0]);
		expect(rgb(scale(10))).toEqual([0, 0, 255]);
	});
});
