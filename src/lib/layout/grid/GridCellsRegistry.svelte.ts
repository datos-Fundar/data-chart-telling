import { getContext, setContext } from 'svelte';
import { GridAlignment } from '$lib/layout/grid/GridAlignment.svelte';
import type { Margins } from '$lib/layout/margins/Margins';
import type { GridCellLayout, GridCellRequest } from '$lib/types/layout/grid';

const GRID_KEY = Symbol('dct-grid');

/** What a grid tells its cells, each read reactively. */
export type GridCellsRegistryInputs = {
	/** Each cell's layout by id, once the grid placed it. */
	layouts: () => Record<string, GridCellLayout>;
	/** Height reserved above every cell for its label. */
	header: () => number;
	/** Whether the grid lines its cells' plot areas up. */
	aligned: () => boolean;
	/** The tag a cell's label falls back to, by its registration order. */
	tag: (index: number) => string | undefined;
	/** The hover-scope id a cell gives what it draws, by its registration order. */
	scope: (index: number) => string | undefined;
};

/**
 * The cells of one `Grid`: each `GridCell` below registers here, with what
 * it asks for, and reads back its layout, its label's tag and its hover
 * scope. In an aligned grid, the plot inside each cell reports the margins
 * it settled on into {@link alignment}. Create it in the `Grid` during
 * component init and {@link provide} it.
 */
export class GridCellsRegistry {
	/** The margins the cells' plots settled on, which an aligned grid lines up. */
	readonly alignment = new GridAlignment();
	readonly #inputs: GridCellsRegistryInputs;
	#cells = $state<{ id: string; request: () => GridCellRequest }[]>([]);
	#next = 0;

	constructor(inputs: GridCellsRegistryInputs) {
		this.#inputs = inputs;
	}

	/** The enclosing grid's cells, or `null` outside a grid. Call during component init. */
	static current(): GridCellsRegistry | null {
		return getContext<GridCellsRegistry | null | undefined>(GRID_KEY) ?? null;
	}

	/** Marks what a grid cell draws as already placed: a figure below it takes no cell of its own. */
	static leave(): void {
		setContext(GRID_KEY, null);
	}

	/** Hands these cells to the `GridCell`s below. Call during component init. */
	provide(): void {
		setContext(GRID_KEY, this);
	}

	/** Every registered cell's request, with its id, in registration order. */
	get requests(): (GridCellRequest & { id: string })[] {
		return this.#cells.map((cell) => ({ id: cell.id, ...cell.request() }));
	}

	/** Registers a cell (its request read reactively), returning its id. */
	register(request: () => GridCellRequest): string {
		const id = `cell-${this.#next++}`;
		this.#cells.push({ id, request });
		return id;
	}

	unregister(id: string): void {
		this.#cells = this.#cells.filter((cell) => cell.id !== id);
	}

	/** The cell's layout, or `undefined` before the grid placed it. */
	layout(id: string): GridCellLayout | undefined {
		return this.#inputs.layouts()[id];
	}

	/** Records the margins a cell's plot settled on - only an aligned grid listens. */
	report(id: string, margins: Margins): void {
		if (this.#inputs.aligned()) this.alignment.report(id, margins);
	}

	/** Height reserved above every cell for its label. */
	get header(): number {
		return this.#inputs.header();
	}

	/** The tag a cell's label falls back to, when the grid tags its cells in order. */
	tagOf(id: string): string | undefined {
		return this.#inputs.tag(GridCellsRegistry.#indexOf(id));
	}

	/** The hover-scope id a cell gives what it draws, when the grid scopes them. */
	scopeOf(id: string): string | undefined {
		return this.#inputs.scope(GridCellsRegistry.#indexOf(id));
	}

	/** A cell's 0-based registration order - insets included. */
	static #indexOf(id: string): number {
		return Number(id.slice('cell-'.length));
	}
}
