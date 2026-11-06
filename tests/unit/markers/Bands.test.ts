import { describe, expect, test } from 'vitest';
import { Bands } from '$lib/markers/band/Bands';

describe('Bands', () => {
	test('one band per value, in order, a repeated one once', () => {
		const bands = Bands.of({ value: ['B', 'A', 'B'] });
		expect(bands.map((b) => b.category)).toEqual(['B', 'A']);
		expect(bands[0].slice).toEqual({ start: 0, end: 0 });
	});

	test('with data, a field key or a function gives each row its category', () => {
		const data = [{ cat: 'A' }, { cat: 'B' }, { cat: null }];
		expect(Bands.of({ data, value: 'cat' }).map((b) => b.category)).toEqual(['A', 'B']);
		expect(
			Bands.of({ data, value: (row: { cat: string }) => row.cat?.toLowerCase() }).map(
				(b) => b.category
			)
		).toEqual(['a', 'b']);
	});

	test('a band keeps its first row and that row`s index', () => {
		const data = [
			{ cat: 'A', n: 1 },
			{ cat: 'A', n: 2 }
		];
		const [band] = Bands.of({ data, value: 'cat' });
		expect(band.row).toBe(data[0]);
		expect(band.index).toBe(0);
	});

	test('dates of the same time are one band', () => {
		const bands = Bands.of({ value: [new Date(2020, 0, 1), new Date(2020, 0, 1)] });
		expect(bands).toHaveLength(1);
	});

	test('a band its rows share fills what all of their slices do', () => {
		const data = [
			{ cat: 'A', slice: { start: 0, end: 0.5 } },
			{ cat: 'A', slice: { start: 0.5, end: 0 } },
			{ cat: 'B', slice: { start: 0.5, end: 0 } }
		];
		const bands = Bands.of({
			data,
			value: 'cat',
			slice: (row: (typeof data)[number]) => row.slice
		});
		expect(bands.map((b) => b.slice)).toEqual([
			{ start: 0, end: 0 },
			{ start: 0.5, end: 0 }
		]);
	});

	test('a row with no slice fills the whole band', () => {
		const data = [{ cat: 'A' }, { cat: 'A', slice: { start: 0.5, end: 0 } }];
		const [band] = Bands.of({
			data,
			value: 'cat',
			slice: (row: { slice?: { start: number; end: number } }) => row.slice
		});
		expect(band.slice).toEqual({ start: 0, end: 0 });
	});
});
