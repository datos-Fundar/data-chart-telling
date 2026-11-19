import { describe, test, expect } from 'vitest';
import { GridCellsRegistry } from '$lib/layout/grid/GridCellsRegistry.svelte';

const registry = () =>
	new GridCellsRegistry({
		layouts: () => ({}),
		header: () => 0,
		aligned: () => false,
		tag: () => undefined,
		scope: () => undefined
	});

describe('GridCellsRegistry.requests', () => {
	test('lists every cell with its id, in registration order', () => {
		const grid = registry();
		const a = grid.register(() => ({ row: 0 }));
		const b = grid.register(() => ({ row: 1 }));
		expect(grid.requests).toEqual([
			{ id: a, row: 0 },
			{ id: b, row: 1 }
		]);
	});

	test('leaves out a cell whose request cannot be read', () => {
		const grid = registry();
		const gone: { r?: number } | undefined = undefined;
		const a = grid.register(() => ({ row: 0 }));
		grid.register(() => ({ row: (gone as unknown as { r: number }).r }));
		const c = grid.register(() => ({ row: 2 }));
		expect(grid.requests).toEqual([
			{ id: a, row: 0 },
			{ id: c, row: 2 }
		]);
	});
});
