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
		expect(MarkerLabels.layoutOf({ type: 'line' }, { text: 'a' })).toBe('point');
		expect(MarkerLabels.layoutOf({ type: 'rule' }, { text: 'a' })).toBeUndefined();
	});

	test('a box label is on its shape unless it is set beyond an edge', () => {
		expect(MarkerLabels.isOnShape({ type: 'cell' }, { text: 'a' })).toBe(true);
		expect(
			MarkerLabels.isOnShape({ type: 'cell' }, { text: 'a', anchor: 'top', outside: true })
		).toBe(false);
	});

	test('a kind without labels, or a shape that says nowhere, builds no label markers', () => {
		expect(MarkerLabels.build({ type: 'rule', label: { text: 'a' } })).toEqual([]);
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

	describe('point labels', () => {
		const rows = (series: string) => [
			{ series, t: 1, v: 1 },
			{ series, t: 2, v: 2 },
			{ series, t: 3, v: null }
		];
		const line = (series: string, label: object | object[]) => ({
			type: 'line',
			data: rows(series),
			x: 't',
			y: 'v',
			label
		});
		const textOf = (marker: { text: unknown }, row: object) =>
			(marker.text as (row: object) => unknown)(row);

		test('leave their markers; other markers keep theirs', () => {
			const { markers, labels } = MarkerLabels.extractPoints([
				line('a', { text: 'v', select: 'last' }),
				{ type: 'cell', x: 'c', y: 'r', label: { text: 'v' } }
			]);
			expect(markers[0]).toMatchObject({ type: 'line', label: undefined });
			expect(markers[1]).toMatchObject({ type: 'cell', label: { text: 'v' } });
			expect(labels).toHaveLength(1);
		});

		test('select among the rows with a place, of each grouping', () => {
			const { labels } = MarkerLabels.extractPoints([
				{
					...line('a', { text: 'v', select: 'last' }),
					data: [...rows('a'), ...rows('b')],
					grouping: 'series'
				}
			]);
			expect(labels[0].data).toEqual([
				{ series: 'a', t: 2, v: 2 },
				{ series: 'b', t: 2, v: 2 }
			]);
		});

		test('of several markers, alike, merge into one, each row read by its own label', () => {
			const shared = { styles: { fontSize: 11 }, declutter: true };
			const { labels } = MarkerLabels.extractPoints([
				line('a', { ...shared, text: () => 'A', select: 'last' }),
				line('b', { ...shared, text: () => 'B', select: 'last' })
			]);
			expect(labels).toHaveLength(1);
			const [merged] = labels;
			expect(merged.data!.map((row) => textOf(merged, row))).toEqual(['A', 'B']);
		});

		test('that differ in what they share draw apart', () => {
			const { labels } = MarkerLabels.extractPoints([
				line('a', { text: 'v', styles: { fontSize: 11 } }),
				line('b', { text: 'v', styles: { fontSize: 14 } })
			]);
			expect(labels).toHaveLength(2);
		});

		test('on a shape with a box start at the anchor of each box, written away from it', () => {
			const bar = {
				type: 'bar',
				isHorizontal: false,
				data: [{ k: 'A', v: 4 }],
				x: 'k',
				y1: 0,
				y2: 'v',
				label: { layout: 'point', text: 'v', anchor: 'top-right', gap: 3 }
			};
			const [label] = MarkerLabels.extractPoints([bar]).labels as unknown as {
				origin: (row: unknown, scales: unknown) => unknown;
				styles: object;
			}[];
			const scales = {
				x: { type: 'band', fn: Object.assign(() => 0, { bandwidth: () => 20 }) },
				y: { type: 'linear', fn: (value: number) => value * 10 }
			};
			expect(label.origin(bar.data[0], scales)).toEqual({ dx: 10, dy: -20 });
			expect(label.styles).toMatchObject({
				dx: 3,
				dy: -3,
				textAnchor: 'start',
				lineAnchor: 'bottom'
			});
			expect(MarkerLabels.layoutOf({ type: 'bar' }, { text: 'a', layout: 'point' })).toBe('point');
		});
	});
});
