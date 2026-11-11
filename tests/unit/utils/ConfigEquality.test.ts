import { describe, test, expect } from 'vitest';
import { ConfigEquality } from '$lib/utils/ConfigEquality';

describe('ConfigEquality.same', () => {
	test('the same value, or objects and arrays alike all the way down', () => {
		expect(ConfigEquality.same(1, 1)).toBe(true);
		expect(ConfigEquality.same({ a: [1, { b: 'x' }] }, { a: [1, { b: 'x' }] })).toBe(true);
		expect(ConfigEquality.same({ a: 1 }, { a: 2 })).toBe(false);
		expect(ConfigEquality.same({ a: 1 }, { a: 1, b: 2 })).toBe(false);
		expect(ConfigEquality.same([1, 2], [1, 2, 3])).toBe(false);
		expect(ConfigEquality.same([1], { 0: 1 })).toBe(false);
	});

	test('a function or a class instance is the same only as the same object', () => {
		const fn = () => 1;
		class Thing {}
		expect(ConfigEquality.same({ fn }, { fn })).toBe(true);
		expect(ConfigEquality.same({ fn: () => 1 }, { fn: () => 1 })).toBe(false);
		expect(ConfigEquality.same(new Thing(), new Thing())).toBe(false);
	});

	test('dates of one time are alike', () => {
		expect(ConfigEquality.same(new Date(5), new Date(5))).toBe(true);
		expect(ConfigEquality.same(new Date(5), new Date(6))).toBe(false);
	});

	test('null and undefined are told apart, and a deep enough value only matches as the same object', () => {
		expect(ConfigEquality.same(null, undefined)).toBe(false);
		expect(ConfigEquality.same({ a: undefined }, { b: undefined })).toBe(false);
		const deep = (n: number): unknown => (n === 0 ? { leaf: 1 } : { next: deep(n - 1) });
		expect(ConfigEquality.same(deep(10), deep(10))).toBe(false);
		const same = deep(10);
		expect(ConfigEquality.same(same, same)).toBe(true);
	});
});
