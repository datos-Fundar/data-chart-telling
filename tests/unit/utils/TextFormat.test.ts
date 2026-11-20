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
