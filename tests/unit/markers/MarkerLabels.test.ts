import { describe, test, expect } from 'vitest';
import { MarkerLabels } from '$lib/markers/labels/MarkerLabels';

describe('MarkerLabels', () => {
	test('a marker has no labels, one, or a list of them', () => {
		expect(MarkerLabels.list({})).toEqual([]);
		expect(MarkerLabels.list({ label: { text: 'a' } })).toEqual([{ text: 'a' }]);
		expect(MarkerLabels.list({ label: [{ text: 'a' }, { text: 'b' }] })).toHaveLength(2);
	});

	test('mapping the labels keeps a single label single and a list a list', () => {
		const upper = (label: { text: unknown }) => ({
			...label,
			text: String(label.text).toUpperCase()
		});
		expect(MarkerLabels.map({ label: { text: 'a' } }, upper as never)).toEqual({
			label: { text: 'A' }
		});
		expect(MarkerLabels.map({ label: [{ text: 'a' }] }, upper as never)).toEqual({
			label: [{ text: 'A' }]
		});
		const bare = { type: 'cell' };
		expect(MarkerLabels.map(bare, upper as never)).toBe(bare);
	});

	test("a label takes its kind's layout, and none on a kind that takes no labels", () => {
		expect(MarkerLabels.layoutOf({ type: 'bar' }, { text: 'a' })).toBe('box');
		expect(MarkerLabels.layoutOf({ type: 'cell' }, { text: 'a', layout: 'box' })).toBe('box');
		expect(MarkerLabels.layoutOf({ type: 'line' }, { text: 'a' })).toBeUndefined();
	});

	test('a box label is on its shape unless it is set beyond an edge', () => {
		expect(MarkerLabels.isOnShape({ text: 'a' })).toBe(true);
		expect(MarkerLabels.isOnShape({ text: 'a', anchor: 'top', outside: true })).toBe(false);
	});

	test('a kind without labels, or a shape that says nowhere, builds no label markers', () => {
		expect(MarkerLabels.build({ type: 'line', label: { text: 'a' } })).toEqual([]);
		expect(MarkerLabels.build({ type: 'rect', label: { text: 'a' } })).toEqual([]);
		expect(
			MarkerLabels.build({
				type: 'rect',
				x1: 'a',
				x2: 'b',
				y1: 'c',
				y2: 'd',
				label: [{ text: 'a' }, { text: 'b' }]
			})
		).toHaveLength(2);
	});
});
