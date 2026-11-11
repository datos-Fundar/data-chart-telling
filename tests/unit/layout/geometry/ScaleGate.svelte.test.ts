import { describe, expect, test } from 'vitest';
import { flushSync } from 'svelte';
import { ScaleGate } from '$lib/layout/geometry/ScaleGate.svelte';
import { ScaleFreeContext, type SvelteplotContext } from '$lib/layout/geometry/ScaleFreeContext';
import { RowContext } from '$lib/phases/context/RowContext';

/** A mark as svelteplot's `Mark` registers it: its rows and options change in place. */
class FakeMark {
	id = Symbol('mark');
	type = 'dot';
	channels = ['x', 'y'];
	scales = new Set(['x', 'y']);
	data: unknown[] = $state.raw([]);
	options: Record<string, unknown> = $state.raw({});
	constructor(data: unknown[]) {
		this.data = data;
	}
}

/** A plot's context that keeps the marks handed to it. */
function plotContext() {
	const marks: { id: symbol; data: unknown[] }[] = [];
	const state = { scales: { x: { skip: new Map() }, color: { skip: new Map() } }, width: 400 };
	const context: SvelteplotContext = {
		addMark: (mark) => void marks.push(mark as never),
		removeMark: (mark) =>
			void marks.splice(
				marks.findIndex((m) => m.id === mark.id),
				1
			),
		getPlotState: () => state
	};
	return { context, marks, state };
}

describe('ScaleGate', () => {
	test('hands the plot the same rows while the mark copies them', () => {
		const { context, marks } = plotContext();
		const rows = [
			{ x: 1, y: 2 },
			{ x: 2, y: 3 }
		];
		const mark = new FakeMark(rows);
		ScaleGate.of(context).addMark(mark);
		const gate = marks[0];
		expect(gate.id).toBe(mark.id);

		let reads = 0;
		const cleanup = $effect.root(() => {
			$effect(() => {
				void gate.data;
				reads++;
			});
		});
		flushSync();
		expect(gate.data).toBe(rows);

		// A copy of the same rows, as svelteplot makes one: the plot is not told.
		mark.data = rows.map((row) => ({ ...row }));
		flushSync();
		expect(gate.data).toBe(rows);
		expect(reads).toBe(1);

		// A row that holds something new is.
		mark.data = [
			{ x: 1, y: 2 },
			{ x: 5, y: 3 }
		];
		flushSync();
		expect(gate.data).toBe(mark.data);
		expect(reads).toBe(2);
		cleanup();
	});

	test('a copy whose rows carry a new context is no new row', () => {
		const { context, marks } = plotContext();
		const row = { x: 1, y: 2 };
		RowContext.tag(row as never, { series: 'A' } as never);
		const mark = new FakeMark([row]);
		ScaleGate.of(context).addMark(mark);
		expect(marks[0].data[0]).toBe(row);
		const copy = { ...row };
		RowContext.tag(copy as never, { series: 'A' } as never);
		mark.data = [copy];
		expect(marks[0].data).toEqual([row]);
		expect(marks[0].data[0]).toBe(row);
	});

	test('removes the gate it handed the plot', () => {
		const { context, marks } = plotContext();
		const gated = ScaleGate.of(context);
		const mark = new FakeMark([]);
		gated.addMark(mark);
		gated.removeMark(mark);
		expect(marks).toHaveLength(0);
	});
});

describe('ScaleFreeContext', () => {
	test('never hands a mark to the plot', () => {
		const { context, marks } = plotContext();
		const free = ScaleFreeContext.of(context);
		free.addMark(new FakeMark([]));
		expect(marks).toHaveLength(0);
	});

	test("reads the plot's state, its output scales skipping every mark", () => {
		const { context, state } = plotContext();
		const seen = ScaleFreeContext.of(context).getPlotState() as typeof state;
		expect(seen.width).toBe(400);
		expect(seen.scales.x.skip).toBe(state.scales.x.skip);
		expect(seen.scales.color.skip.get('fill')?.has(Symbol('any'))).toBe(true);
		// The same view while the state is the same.
		expect(ScaleFreeContext.of(context).getPlotState()).toBe(seen);
	});
});
