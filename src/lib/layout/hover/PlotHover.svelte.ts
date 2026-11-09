import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { HoverState } from '$lib/layout/hover/HoverState.svelte';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { HoverPoint } from '$lib/types/layout/hover';
import type { HoverLook } from '$lib/types/markers/common';
import type { HoverConfig } from '$lib/types/plots/props';

/** What a plot's hover is built from, each read reactively. */
export type PlotHoverInputs<T extends Record<string, unknown>> = {
	/** The plot's hover config: its points, label, strategy, sync and tooltip. */
	hover: () => HoverConfig<T>;
	getX: () => (d: T) => AxisValue;
	getY: () => (d: T) => AxisValue;
	/** The plot's box, to carry the cursor to synced plots as a fraction of it. */
	width: () => number;
	height: () => number;
};

/**
 * One plot's hover: the figure's {@link HoverState} (or its own, outside a
 * figure) seen from the plot's hover scope. It turns the pointer into the
 * shared hover (`onPointer`, `onMove`, `onLeave`) and reads back what the
 * plot draws: the highlighted points, the hovered one, its crosshairs and
 * its tooltip. Create it during component init.
 */
export class PlotHover<T extends Record<string, unknown>> {
	readonly state: HoverState;
	readonly #inputs: PlotHoverInputs<T>;
	readonly #scope: () => string;
	#cursor = $state<{ x: number; y: number } | null>(null);
	// The hovered point's pixel position, as `HoverMarker` reports it.
	#activePixel = $state<{ x: number; y: number } | null>(null);

	constructor(inputs: PlotHoverInputs<T>) {
		this.#inputs = inputs;
		this.#scope = HoverState.scope();
		const shared = HoverState.current();
		this.state = shared ?? new HoverState();
		// Outside a figure, the plot's own config drives its own hover.
		if (!shared) {
			$effect(() => {
				this.state.strategy = inputs.hover().strategy ?? 'x';
				this.state.sync = inputs.hover().sync ?? false;
			});
		}
	}

	/** Whether this plot owns the hover. */
	get #owner(): boolean {
		return this.state.source === this.#scope();
	}

	/** The point a hit row is: by identity, else by its x and y (svelteplot's `Pointer` hands back clones). */
	#pointFor(row: T): HoverPoint<T> | undefined {
		const points = this.#inputs.hover().points;
		const byIdentity = points.find((p) => p.row === row);
		if (byIdentity) return byIdentity;
		const x = this.#inputs.getX()(row);
		const y = this.#inputs.getY()(row);
		return points.find((p) => HoverState.same(p.x, x) && HoverState.same(p.y, y));
	}

	// The points matched here: in the owning plot, or in every one while synced.
	readonly #matched = $derived.by((): HoverPoint<T>[] => {
		if (!this.#owner && !this.state.sync) return [];
		return this.state.match(this.#inputs.hover().points);
	});

	/** A row's place, as a key: its x, y and series. */
	static #keyOf(x: unknown, y: unknown, series: unknown): string {
		const plain = (value: unknown) => (value instanceof Date ? +value : value);
		return JSON.stringify([plain(x), plain(y), series ?? null]);
	}

	// The rows the hover can reach, and the matched ones: by identity, and by their place. Built whole
	// inside this derivation and never changed after it, so they have nothing to react to.
	readonly #reach = $derived.by(() => {
		const points = this.#inputs.hover().points;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const matched = new Set<HoverPoint<T>>(this.#matched);
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const byRow = new Map<unknown, HoverPoint<T>>(points.map((p) => [p.row, p]));
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const byPlace = new Map<string, HoverPoint<T>>(
			points.map((p) => [PlotHover.#keyOf(p.x, p.y, p.series), p])
		);
		return { matched, byRow, byPlace };
	});

	/**
	 * How the hover reaches `row`: `'active'` while it is matched, `'other'` while it can be hovered but is not,
	 * `null` while nothing is hovered here or it is no row the hover can reach (one the legend hides). A row is
	 * found by identity, else by its x, y and `series`. `series` narrows the active rows to that series.
	 */
	roleOf(row: T, series?: string): 'active' | 'other' | null {
		const { matched, byRow, byPlace } = this.#reach;
		if (matched.size === 0) return null;
		const point = byRow.get(row) ?? this.#placed(byPlace, row);
		if (!point) return null;
		return matched.has(point) && (series === undefined || point.series === series)
			? 'active'
			: 'other';
	}

	/** The point at `row`'s place: of its own series, else of none (a heatmap's cell). */
	#placed(byPlace: Map<string, HoverPoint<T>>, row: T): HoverPoint<T> | undefined {
		const x = this.#inputs.getX()(row);
		const y = this.#inputs.getY()(row);
		const series = (row as Record<string, unknown>)[SERIES_KEY];
		return (
			byPlace.get(PlotHover.#keyOf(x, y, series)) ?? byPlace.get(PlotHover.#keyOf(x, y, undefined))
		);
	}

	/** The matched points the tooltip reads: only the tooltip's `series`, when it names some. */
	readonly matchedRows = $derived.by((): HoverPoint<T>[] => {
		const series = this.#inputs.hover().tooltip?.series;
		if (!series || series.length === 0) return this.#matched;
		return this.#matched.filter((p) => p.series != null && series.includes(p.series));
	});

	/** The points the hover marker highlights. */
	readonly points = $derived(
		this.#matched.map(({ x, y, label, series, color, areaInset, context, row }) => ({
			x,
			y,
			label,
			series,
			color,
			areaInset,
			context,
			row
		}))
	);

	/**
	 * The matched point actually under the cursor: of the hovered series, and
	 * among ties, the one at the hovered x and y. Crosshair rules sit on it.
	 */
	readonly activePoint = $derived.by((): HoverPoint<T> | null => {
		const matched = this.#matched;
		if (matched.length === 0) return null;
		const { activeSeries, activeX, activeY } = this.state;
		const bySeries = matched.filter((p) => p.series === activeSeries);
		const candidates = bySeries.length > 0 ? bySeries : matched;
		if (candidates.length === 1 || activeX == null || activeY == null) return candidates[0];
		return (
			candidates.find((p) => HoverState.same(p.x, activeX) && HoverState.same(p.y, activeY)) ??
			candidates[0]
		);
	});

	/**
	 * The plot kind's own hover under the strategy in force - the figure's, which a composer or a scrolly step can
	 * change while the plot is shown - for an author's `hover` marker to be laid over.
	 */
	get look(): HoverLook {
		return this.#inputs.hover().look?.(this.state.strategy) ?? {};
	}

	/** Whether a crosshair rule runs across x - the strategy's, unless the config turns them off. */
	get impliesCrosshairX(): boolean {
		return this.#inputs.hover().crosshair !== false && this.state.crosshairX;
	}

	/** Whether a crosshair rule runs across y. */
	get impliesCrosshairY(): boolean {
		return this.#inputs.hover().crosshair !== false && this.state.crosshairY;
	}

	/** The pointer's position in the plot's box, while it is over this plot. */
	get cursor(): { x: number; y: number } | null {
		return this.#cursor;
	}

	/** Whether the tooltip shows: under the cursor in the owning plot, in every synced one. */
	get showTooltip(): boolean {
		if (this.matchedRows.length === 0) return false;
		return this.#owner ? this.#cursor != null : this.state.sync;
	}

	/** Where the tooltip sits: the cursor, else the hovered point, else the owning plot's cursor carried over. */
	get tooltipPosition(): { x: number; y: number } | null {
		if (this.#cursor) return this.#cursor;
		if (this.#activePixel) return this.#activePixel;
		const frac = this.state.cursorFrac;
		return frac ? { x: frac.x * this.#inputs.width(), y: frac.y * this.#inputs.height() } : null;
	}

	/** The rows under the pointer, from svelteplot's `Pointer` or a mark's own hit area. */
	onPointer = (rows: T[]): void => {
		const row = rows[0];
		if (row === undefined) {
			this.state.leave(this.#scope(), { cursor: true });
			return;
		}
		const point = this.#pointFor(row);
		this.state.enter(
			this.#scope(),
			point?.x ?? this.#inputs.getX()(row),
			point?.y ?? this.#inputs.getY()(row),
			point?.series ?? null
		);
	};

	onMove = (e: PointerEvent): void => {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		this.#cursor = { x, y };
		const width = this.#inputs.width();
		const height = this.#inputs.height();
		if (width > 0 && height > 0) this.state.cursorFrac = { x: x / width, y: y / height };
	};

	onLeave = (): void => {
		this.#cursor = null;
		this.state.leave(this.#scope());
	};

	/** The hovered point's pixel position, as the hover marker drew it. */
	reportActivePointPixel = (position: { x: number; y: number } | null): void => {
		this.#activePixel = position;
	};
}
