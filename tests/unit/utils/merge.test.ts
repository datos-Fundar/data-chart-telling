import { describe, test, expect } from 'vitest';
import { merge } from '$lib/utils/merge';

describe('merge', () => {
	test('merges plain objects at any depth, the patch winning', () => {
		expect(merge({ a: { b: 1, c: { d: 1, e: 2 } }, f: 1 }, { a: { c: { d: 9 } } })).toEqual({
			a: { b: 1, c: { d: 9, e: 2 } },
			f: 1
		});
	});

	test('replaces arrays and primitives instead of merging them', () => {
		expect(merge({ a: [1, 2], b: 1 }, { a: [3], b: 2 })).toEqual({ a: [3], b: 2 });
	});

	test('an undefined in the patch leaves the base alone', () => {
		expect(merge({ a: 1, b: { c: 1 } }, { a: undefined, b: { c: undefined } })).toEqual({
			a: 1,
			b: { c: 1 }
		});
	});

	test('returns the other side when one is absent, and never mutates', () => {
		const base = { a: { b: 1 } };
		expect(merge(base, undefined)).toBe(base);
		expect(merge(undefined, base)).toBe(base);
		merge(base, { a: { b: 2 } });
		expect(base).toEqual({ a: { b: 1 } });
	});
});
