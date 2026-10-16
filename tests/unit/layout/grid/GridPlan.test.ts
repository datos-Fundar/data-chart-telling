import { describe, test, expect } from 'vitest';
import { Margins } from '$lib/layout/margins/Margins';
import { GridPlan } from '$lib/layout/grid/GridPlan';

describe('GridPlan - placement', () => {
	test('flows cells into `columns`, row by row', () => {
		const { rows, columns, spans } = new GridPlan([{}, {}, {}], { columns: 2 });
		expect({ rows, columns }).toEqual({ rows: 2, columns: 2 });
		expect(spans.map((s) => [s.row, s.col])).toEqual([
			[0, 0],
			[0, 1],
			[1, 0]
		]);
	});

	test('defaults `columns` to the smallest square that fits every cell', () => {
		expect(new GridPlan([{}, {}, {}, {}, {}]).columns).toBe(3);
	});

	test('a named area takes its bounding box; the rest flow around it', () => {
		const { spans } = new GridPlan([{}, { area: 'main' }], {
			areas: ['main main side', 'main main .']
		});
		expect(spans[1]).toEqual({ row: 0, col: 0, rowSpan: 2, colSpan: 2 });
		// `side` is named, so the flowed cell skips it to the first unnamed slot.
		expect(spans[0]).toEqual({ row: 1, col: 2, rowSpan: 1, colSpan: 1 });
	});

	test('explicit row/col, with `rows` keeping trailing empty rows', () => {
		const { rows, spans } = new GridPlan([{ row: 0, col: 1 }], { columns: 2, rows: 3 });
		expect(rows).toBe(3);
		expect(spans[0]).toEqual({ row: 0, col: 1, rowSpan: 1, colSpan: 1 });
	});
});

describe('GridPlan.edges', () => {
	test('a side is outer when no cell lies beyond it', () => {
		// 2 columns, 3 cells: the top-right cell has nothing below it.
		const { edges } = new GridPlan([{}, {}, {}], { columns: 2 });
		expect(edges[0]).toEqual({ top: true, right: false, bottom: false, left: true });
		expect(edges[1]).toEqual({ top: true, right: true, bottom: true, left: false });
		expect(edges[2]).toEqual({ top: false, right: true, bottom: true, left: true });
	});
});

describe('GridPlan.tracks', () => {
	const plan = new GridPlan([{}, {}], { columns: 2 });

	test('splits the width by `widths` weights, minus gaps', () => {
		const { colWidths, boxes } = plan.tracks({
			width: 310,
			height: 100,
			gap: 10,
			widths: [2, 1]
		});
		expect(colWidths).toEqual([200, 100]);
		expect(boxes.map((b) => b.width)).toEqual([200, 100]);
		expect(boxes[0].margins).toBeUndefined();
	});

	test('`header` comes off every row, but not off the cell boxes twice', () => {
		const { rowHeights, boxes } = plan.tracks({
			width: 200,
			height: 100,
			gap: 0,
			header: 20
		});
		expect(rowHeights).toEqual([100]);
		expect(boxes[0].height).toBe(80);
	});

	test('aligned: each column takes its widest margins, pinned on every cell in it', () => {
		const stacked = new GridPlan([{}, {}], { columns: 1 });
		const { boxes } = stacked.tracks({
			width: 300,
			height: 200,
			gap: 0,
			margins: [new Margins(5, 0, 20, 30), new Margins(5, 0, 20, 80)]
		});
		expect(boxes.map((b) => b.margins?.left)).toEqual([80, 80]);
		// Equal plot heights: each row gets the same panel share on top of its margins.
		expect(boxes[0].height).toBe(boxes[1].height);
	});

	test('waits for every cell to report before aligning', () => {
		const { boxes } = plan.tracks({
			width: 200,
			height: 100,
			gap: 0,
			margins: [Margins.of({ left: 40 }), undefined]
		});
		expect(boxes[0].margins).toBeUndefined();
		expect(boxes[0].width).toBe(100);
	});
});
