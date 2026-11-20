import { describe, test, expect } from 'vitest';
import { TextFormat } from '$lib/utils/TextFormat';

// Every letter is 10px wide.
const measure = (text: string) => text.length * 10;

describe('TextFormat', () => {
	test('writes a text whole while nothing asks for less', () => {
		expect(TextFormat.of(undefined, measure)('A long series name')).toBe('A long series name');
		expect(TextFormat.of({}, measure)('A long series name')).toBe('A long series name');
		expect(TextFormat.isSet({})).toBe(false);
		expect(TextFormat.maybe({}, measure)).toBeUndefined();
	});

	test('`maxWidth` cuts a longer text short with an ellipsis, so that it fits', () => {
		const write = TextFormat.of({ maxWidth: 60 }, measure);
		expect(write('Argentina')).toBe('Argen…');
		expect(measure(write('Argentina'))).toBeLessThanOrEqual(60);
		expect(write('Chile')).toBe('Chile');
	});

	test('a text that fits is left alone, one that cannot hold a letter is dropped', () => {
		expect(TextFormat.of({ maxWidth: 50 }, measure)('Chile')).toBe('Chile');
		expect(TextFormat.of({ maxWidth: 5 }, measure)('Chile')).toBe('');
	});

	test('takes its fields out of a config that carries them beside its own', () => {
		expect(TextFormat.displayOf({ maxWidth: 40 })).toEqual({ maxWidth: 40 });
		expect(TextFormat.displayOf(true)).toEqual({ maxWidth: undefined });
		expect(TextFormat.displayOf(undefined)).toEqual({ maxWidth: undefined });
	});
});

describe('TextFormat.of', () => {
	test('swaps first, then the cut to `maxWidth` of what the swaps left', () => {
		const write = TextFormat.of({ replace: { Ciudad: 'C' }, maxWidth: 50 }, measure);
		expect(write('Ciudad Autónoma')).toBe('C Au…');
		expect(write('Chile')).toBe('Chile');
	});

	test('writes the prefix and suffix too when the display has them', () => {
		expect(TextFormat.of({ prefix: '<', suffix: '>' }, measure)('b')).toBe('<b>');
	});

	test('is set by any of its fields', () => {
		expect(TextFormat.isSet({ replace: { a: 'b' } })).toBe(true);
		expect(TextFormat.isSet({ suffix: '%' })).toBe(true);
		expect(TextFormat.isSet({ maxWidth: 10 })).toBe(true);
		expect(TextFormat.isSet({ replace: [] })).toBe(false);
	});

	test('`displayOf` keeps the swaps and the width, not the prefix and suffix a number keeps', () => {
		expect(
			TextFormat.displayOf({ prefix: 'x', suffix: 'y', replace: { a: 'b' }, maxWidth: 3 })
		).toEqual({ replace: { a: 'b' }, maxWidth: 3 });
	});
});

describe('TextFormat.rewrite', () => {
	test('a prefix and a suffix go around the label', () => {
		expect(TextFormat.rewrite('25-29', { suffix: ' years' })).toBe('25-29 years');
		expect(TextFormat.rewrite('1', { prefix: 'Q: ' })).toBe('Q: 1');
		expect(TextFormat.rewrite('b', { prefix: '<', suffix: '>' })).toBe('<b>');
	});

	test('a record swaps a text for another, every match', () => {
		expect(TextFormat.rewrite('Quintile 1 de Quintile', { replace: { Quintile: 'Q' } })).toBe(
			'Q 1 de Q'
		);
	});

	test('a list swaps in order, a pattern as an expression', () => {
		expect(TextFormat.rewrite('Quartile 3', { replace: [[/^Quartile /, 'Q: ']] })).toBe('Q: 3');
		expect(
			TextFormat.rewrite('a b', {
				replace: [
					['a', 'b'],
					['b', 'c']
				]
			})
		).toBe('c c');
	});

	test('a replacement is written as it is, not read as a pattern', () => {
		expect(TextFormat.rewrite('a', { replace: { a: '$&$&' } })).toBe('$&$&');
	});

	test('the swaps go before the prefix and suffix', () => {
		expect(
			TextFormat.rewrite('Quintile 1', { replace: { Quintile: 'Q' }, suffix: 'Quintile' })
		).toBe('Q 1Quintile');
	});

	test('nothing set leaves the label as it is', () => {
		expect(TextFormat.rewrite('x', {})).toBe('x');
	});
});
