import { describe, test, expect } from 'vitest';
import { Covering } from '$lib/markers/text/Covering';
import { Box } from '$lib/layout/margins/Box';

const dot = (cx: number, cy: number, r: number) => ({
	box: new Box(cx - r, cy - r, 2 * r, 2 * r),
	round: true
});
const label = (cx: number, cy: number) => new Box(cx - 6, cy - 5, 12, 10);

describe('Covering', () => {
	test('a label is hidden by a shape of a later row, never by an earlier one', () => {
		const labels = [label(50, 50), label(56, 50)];
		const shapes = [dot(50, 50, 10), dot(56, 50, 10)];
		expect([...Covering.hidden(labels, shapes)]).toEqual([0]);
	});

	test('a round shape covers only what its circle reaches, not its box corners', () => {
		// The label sits off the circle's corner: inside its box, outside its circle.
		const corner = new Box(88, 88, 2, 2);
		expect(Covering.hidden([corner, label(0, 0)], [undefined, dot(80, 80, 10)]).size).toBe(0);
		expect(
			Covering.hidden([corner, label(0, 0)], [undefined, { ...dot(80, 80, 10), round: false }]).size
		).toBe(1);
	});

	test('rows without a shape cover nothing', () => {
		expect(Covering.hidden([label(0, 0), label(0, 0)], [undefined, undefined]).size).toBe(0);
	});
});
