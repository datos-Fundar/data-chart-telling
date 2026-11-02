import { describe, test, expect } from 'vitest';
import { TickLines } from '$lib/layout/scales/TickLines';

describe('TickLines', () => {
	test('a list is the lines as they are, a text is split at its line breaks', () => {
		expect(TickLines.of(['Vivienda y', 'servicios'])).toEqual(['Vivienda y', 'servicios']);
		expect(TickLines.of('Vivienda y\nservicios')).toEqual(['Vivienda y', 'servicios']);
		expect(TickLines.of('Salud')).toEqual(['Salud']);
	});

	test('every tick is formatted with its position and all the ticks', () => {
		const lines = TickLines.ofTicks(['a b', 'c'], (d, i, ticks) => [
			`${d}`,
			`${i}/${ticks.length}`
		]);
		expect(lines).toEqual([
			['a b', '0/2'],
			['c', '1/2']
		]);
	});

	test('a label is split at its spaces so that its longest line is the shortest it can be', () => {
		expect(TickLines.split('Vivienda y servicios', 2)).toEqual(['Vivienda y', 'servicios']);
		expect(TickLines.split('Alimentos y bebidas no alcohólicas', 2)).toEqual([
			'Alimentos y bebidas',
			'no alcohólicas'
		]);
		expect(TickLines.split('Alimentos y bebidas no alcohólicas', 3)).toEqual([
			'Alimentos y',
			'bebidas no',
			'alcohólicas'
		]);
	});

	test('a label of one word, or asked for one line, is not split', () => {
		expect(TickLines.split('Salud', 2)).toEqual(['Salud']);
		expect(TickLines.split('Vivienda y servicios', 1)).toEqual(['Vivienda y servicios']);
		expect(TickLines.split('a b', 5)).toEqual(['a', 'b']);
	});

	test('wrapped splits the text a format gives, or the tick, and keeps a list as it is', () => {
		const plain = TickLines.wrapped(undefined, 2);
		expect(plain('Vivienda y servicios', 0, [])).toEqual(['Vivienda y', 'servicios']);
		const upper = TickLines.wrapped((d) => String(d).toUpperCase(), 2);
		expect(upper('uno dos', 0, [])).toEqual(['UNO', 'DOS']);
		const own = TickLines.wrapped(() => ['a b', 'c'], 2);
		expect(own('x', 0, [])).toEqual(['a b', 'c']);
	});

	test('an axis is multiline when some tick takes more than one line', () => {
		expect(TickLines.isMultiline([['a'], ['b']])).toBe(false);
		expect(TickLines.isMultiline([['a'], ['b', 'c']])).toBe(true);
		expect(TickLines.isMultiline([])).toBe(false);
	});
});
