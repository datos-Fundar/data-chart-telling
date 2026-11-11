import { RowContext } from '$lib/phases/context/RowContext';
import type { SvelteplotContext } from './ScaleFreeContext';

/** A mark as svelteplot's plot holds it, and works its scales out from. */
type PlotMark = {
	id: symbol;
	type: string;
	channels: unknown[];
	scales: Set<unknown>;
	data: unknown[];
	options: Record<PropertyKey, unknown>;
};

/**
 * A mark as its plot sees it: the mark itself, but for its rows, which change only when they hold something new.
 *
 * svelteplot works a plot's scales out from every mark's rows, again whenever one of them is a new array. A mark
 * hands it a new array each time it copies its rows (any of its props a new value is enough) and the next time
 * one row's style changes, even a style that no scale reads - a hover's, at every move of the pointer. The copy
 * holds the same rows, so the scales would come out the same: the plot is told of it only when a row differs.
 */
class GatedMark {
	readonly #mark: PlotMark;

	/** The rows the plot last saw, kept while the mark's are a copy of them. */
	readonly data = $derived.by(() => this.#rows(this.#mark.data));
	#seen: unknown[] | undefined;

	constructor(mark: PlotMark) {
		this.#mark = mark;
	}

	get id() {
		return this.#mark.id;
	}
	get type() {
		return this.#mark.type;
	}
	get channels() {
		return this.#mark.channels;
	}
	get scales() {
		return this.#mark.scales;
	}
	get options() {
		return this.#mark.options;
	}

	#rows(rows: unknown[]): unknown[] {
		const seen = this.#seen;
		if (seen && GatedMark.#sameRows(seen, rows)) return seen;
		this.#seen = rows;
		return rows;
	}

	/** Whether two lists of rows hold the same values, row by row and field by field. */
	static #sameRows(a: unknown[], b: unknown[]): boolean {
		if (a === b) return true;
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (!GatedMark.#sameRow(a[i], b[i])) return false;
		}
		return true;
	}

	/**
	 * Whether two rows hold the same values, field by field - but for the context the plot keeps on each row, which
	 * no scale reads and which the plot works out anew as it lays its rows out again.
	 */
	static #sameRow(a: unknown, b: unknown): boolean {
		if (a === b) return true;
		if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
		const keys = Reflect.ownKeys(a);
		if (keys.length !== Reflect.ownKeys(b).length) return false;
		return keys.every(
			(key) =>
				key === RowContext.key ||
				Object.is(
					(a as Record<PropertyKey, unknown>)[key],
					(b as Record<PropertyKey, unknown>)[key]
				)
		);
	}
}

export const ScaleGate = {
	/**
	 * `parent`, the plot's own context, with each mark handed to the plot behind a `GatedMark`: the scales are
	 * worked out again when a mark's rows hold something new, not each time the mark copies them.
	 */
	of(parent: SvelteplotContext): SvelteplotContext {
		// Which gate stands for which mark: bookkeeping no view reads, so nothing has to react to it.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const gates = new Map<symbol, GatedMark>();
		return {
			...parent,
			addMark: (mark) => {
				if (gates.has(mark.id)) return;
				const gate = new GatedMark(mark as PlotMark);
				gates.set(mark.id, gate);
				parent.addMark(gate);
			},
			removeMark: (mark) => {
				const gate = gates.get(mark.id);
				if (!gate) return;
				gates.delete(mark.id);
				parent.removeMark(gate);
			}
		};
	}
};
