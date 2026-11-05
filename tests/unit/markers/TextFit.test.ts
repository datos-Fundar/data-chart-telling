import { describe, test, expect } from 'vitest';
import { TextFit, type TextFitOptions } from '$lib/markers/text/TextFit';

/** Every letter is `0.5` of the font size wide, so a text at size 10 writes 5px a letter. */
const measure = (text: string, size: number) => text.length * size * 0.5;

const fit = (over: Partial<TextFitOptions>) =>
	TextFit.fit({
		text: 'Wholesale trade',
		width: 100,
		height: 40,
		fontSize: 12,
		minFontSize: 8,
		lineHeight: 1.2,
		minLetters: 3,
		measure,
		...over
	});

describe('TextFit.fit', () => {
	test('writes a text that fits at the size it is given', () => {
		expect(fit({ width: 200 })).toEqual({ text: 'Wholesale trade', fontSize: 12 });
	});

	test('shrinks the font before it cuts anything', () => {
		// 15 letters need 7.5 * size: 100px holds them at size 13 or less, so a 16 shrinks to 13.
		expect(fit({ fontSize: 16, height: 20 })).toEqual({ text: 'Wholesale trade', fontSize: 13 });
	});

	test('breaks the text into lines at its words when the box is tall enough', () => {
		expect(fit({ width: 60, height: 40 })).toEqual({ text: 'Wholesale\ntrade', fontSize: 12 });
	});

	test('cuts the last line short with an ellipsis at the smallest size when no size holds it', () => {
		const out = fit({ width: 40, height: 10, text: 'Wholesale trade' });
		expect(out?.fontSize).toBe(8);
		expect(out?.text).toMatch(/^Who.*…$/);
		expect(out?.text).not.toContain('\n');
	});

	// A line of 12px high holds a size of 10, at a line height of 1.2.
	test('writes the fallback when almost none of the text would show', () => {
		expect(fit({ width: 14, height: 12, text: 'Wholesale trade', fallback: '15' })).toEqual({
			text: '15',
			fontSize: 10
		});
	});

	test('writes nothing when not even the fallback fits', () => {
		expect(fit({ width: 6, height: 12, text: 'Wholesale trade', fallback: '15' })).toBeUndefined();
		expect(fit({ width: 6, height: 12, text: 'Wholesale trade' })).toBeUndefined();
	});

	test('writes nothing in a box with no room for a line', () => {
		expect(fit({ height: 5, fallback: '15' })).toBeUndefined();
	});

	test('keeps the line breaks the text has', () => {
		expect(fit({ text: 'Trade\n15', width: 200 })).toEqual({ text: 'Trade\n15', fontSize: 12 });
	});

	test('cuts a word wider than a line', () => {
		const out = fit({ text: 'Internationalization', width: 50, height: 40 });
		expect(out?.text).toMatch(/…$/);
	});
});
