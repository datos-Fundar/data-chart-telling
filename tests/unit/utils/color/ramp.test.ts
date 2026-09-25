import { describe, test, expect } from 'vitest';
import { resolveColorScale } from '$lib/utils/color';

describe('resolveColorScale', () => {
	// d3-interpolate's rgb interpolator returns `rgb(r, g, b)` strings, even
	// at the exact endpoints — not the hex the config was given in.
	test('with no config, falls back to the default 2-color scheme over the computed domain', () => {
		const scale = resolveColorScale(undefined, [0, 100], ['#000000', '#ffffff']);
		expect(scale(0)).toBe('rgb(0, 0, 0)');
		expect(scale(100)).toBe('rgb(255, 255, 255)');
	});

	test('an explicit domain wins over the computed one', () => {
		const scale = resolveColorScale({ domain: [0, 10] }, [0, 100], ['#000000', '#ffffff']);
		expect(scale(10)).toBe('rgb(255, 255, 255)');
	});

	test('interpolates smoothly across more than 2 stops', () => {
		const scale = resolveColorScale(
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
		const scale = resolveColorScale(
			{ scheme: ['#0000ff', '#ffffff', '#ff0000'], pivot: 90 },
			[0, 100],
			['#000000', '#ffffff']
		);
		expect(scale(90)).toBe('rgb(255, 255, 255)');
	});

	test('a Record scheme resolves by direct category lookup', () => {
		const scale = resolveColorScale(
			{ scheme: { a: '#ff0000', b: '#00ff00' } },
			['a', 'b'],
			['#000000', '#ffffff']
		);
		expect(scale('a')).toBe('#ff0000');
		expect(scale('b')).toBe('#00ff00');
		expect(scale('c')).toBe('#ccc');
	});

	test('a categorical domain with an array scheme cycles through it by category index', () => {
		const scale = resolveColorScale(
			{ scheme: ['#ff0000', '#00ff00', '#0000ff'] },
			['a', 'b', 'c'],
			['#000000', '#ffffff']
		);
		expect(scale('a')).toBe('#ff0000');
		expect(scale('c')).toBe('#0000ff');
	});

	test('returns the unknown fallback for a null/undefined value', () => {
		const scale = resolveColorScale({ unknown: '#123456' }, [0, 100], ['#000000', '#ffffff']);
		expect(scale(null)).toBe('#123456');
		expect(scale(undefined)).toBe('#123456');
	});

	test('returns the unknown fallback when there is no domain to resolve against', () => {
		const scale = resolveColorScale(undefined, undefined, ['#000000', '#ffffff']);
		expect(scale(50)).toBe('#ccc');
	});

	test('a named d3-scale-chromatic scheme resolves over the continuous domain', () => {
		const scale = resolveColorScale({ scheme: 'turbo' }, [0, 100], ['#000000', '#ffffff']);
		expect(scale(0)).not.toBe(scale(100));
		expect(scale(0)).not.toBe('#ccc');
	});

	test('a named scheme is case-insensitive', () => {
		const lower = resolveColorScale({ scheme: 'turbo' }, [0, 100], ['#000000', '#ffffff']);
		const mixed = resolveColorScale({ scheme: 'Turbo' }, [0, 100], ['#000000', '#ffffff']);
		expect(mixed(50)).toBe(lower(50));
	});

	test('an unknown scheme name falls back to the unknown color', () => {
		const scale = resolveColorScale(
			{ scheme: 'not-a-real-scheme' },
			[0, 100],
			['#000000', '#ffffff']
		);
		expect(scale(50)).toBe('#ccc');
	});

	test('a named scheme samples evenly across a categorical domain', () => {
		const scale = resolveColorScale({ scheme: 'turbo' }, ['a', 'b', 'c'], ['#000000', '#ffffff']);
		expect(scale('a')).not.toBe(scale('c'));
		expect(scale('z')).toBe('#ccc');
	});

	test('a pivot works with a named scheme too (not just an explicit array)', () => {
		const scale = resolveColorScale(
			{ scheme: 'rdylbu', pivot: 50 },
			[0, 100],
			['#000000', '#ffffff']
		);
		expect(scale(50)).toBeDefined();
		expect(scale(0)).not.toBe(scale(100));
	});
});
