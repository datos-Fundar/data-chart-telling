import { getContext, setContext } from 'svelte';
import type { Margins } from '$lib/layout/margins/Margins';

const CELL_ALIGNMENT_KEY = Symbol('dct-cell-alignment');

/**
 * How an aligned `Grid` collects the margins its cells' plots settle on. A
 * report is kept once it moves by more than 1px, and `settled` only follows
 * once reports stop changing for `delay` ms - a plot reports placeholder
 * margins before svelteplot sizes its axes, and pinning those would freeze them.
 */
export class GridAlignment {
	#live: Record<string, Margins> = {};
	#timer: ReturnType<typeof setTimeout> | undefined;
	#settled = $state.raw<Record<string, Margins>>({});

	constructor(readonly delay = 150) {}

	/** Each cell's settled margins, by cell id. */
	get settled(): Record<string, Margins> {
		return this.#settled;
	}

	/** Records the margins `cell`'s plot settled on. */
	report(cell: string, margins: Margins): void {
		if (margins.equals(this.#live[cell], 1)) return;
		this.#live = { ...this.#live, [cell]: margins };
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => (this.#settled = this.#live), this.delay);
	}
}

/**
 * One grid cell's part in aligning its grid: where the plot inside reports
 * the margins it settled on, and the margins the grid pinned on it.
 */
export class CellAlignment {
	readonly #report: (margins: Margins) => void;
	readonly #pinned: () => Margins | undefined;

	constructor(report: (margins: Margins) => void, pinned: () => Margins | undefined) {
		this.#report = report;
		this.#pinned = pinned;
	}

	/** The enclosing cell's alignment, or `null` outside a grid cell. Call during component init. */
	static current(): CellAlignment | null {
		return getContext<CellAlignment | undefined>(CELL_ALIGNMENT_KEY) ?? null;
	}

	/** Hands this alignment to the plot below. Call during component init. */
	provide(): void {
		setContext(CELL_ALIGNMENT_KEY, this);
	}

	report(margins: Margins): void {
		this.#report(margins);
	}

	/** The margins the grid pinned on this cell, once it aligned. */
	get pinned(): Margins | undefined {
		return this.#pinned();
	}
}
