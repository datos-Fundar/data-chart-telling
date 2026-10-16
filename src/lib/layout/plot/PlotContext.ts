import { getContext, setContext } from 'svelte';
import type { PlotHover } from '$lib/layout/hover/PlotHover.svelte';
import type { LegendState } from '$lib/layout/legend/LegendState.svelte';
import type { TimelineState } from '$lib/layout/timeline/TimelineState.svelte';
import type { PlotMargins } from '$lib/layout/margins/PlotMargins.svelte';
import type { PlotAxes } from '$lib/phases/data/PlotAxes';

const PLOT_CONTEXT_KEY = Symbol('dct-plot-context');

/** What a plot's context is built from; the functions are read reactively. */
export type PlotContextParts<T extends Record<string, unknown>> = {
	hover: PlotHover<T>;
	legend: LegendState | null;
	timeline: TimelineState | null;
	margins: PlotMargins;
	scales: () => object | undefined;
	axes: () => PlotAxes | undefined;
	data: () => T[];
	size: () => { width: number; height: number };
};

/**
 * Everything one plot is, gathered where what draws inside it can reach it:
 * its hover, its figure's legend and timeline, its margins, scales, axes, rows and box. The
 * mutable side; {@link PublicPlotContext} is what a user gets to read.
 */
export class PlotContext<T extends Record<string, unknown> = Record<string, unknown>> {
	readonly hover: PlotHover<T>;
	readonly legend: LegendState | null;
	readonly timeline: TimelineState | null;
	readonly margins: PlotMargins;
	readonly #parts: PlotContextParts<T>;

	constructor(parts: PlotContextParts<T>) {
		this.#parts = parts;
		this.hover = parts.hover;
		this.legend = parts.legend;
		this.timeline = parts.timeline;
		this.margins = parts.margins;
	}

	/** The enclosing plot's context, or `null` outside one. Call during component init. */
	static current(): PlotContext | null {
		return getContext<PlotContext | undefined>(PLOT_CONTEXT_KEY) ?? null;
	}

	/** A new context for everything drawn below. Call during component init. */
	static provide<T extends Record<string, unknown>>(parts: PlotContextParts<T>): PlotContext<T> {
		const context = new PlotContext(parts);
		setContext(PLOT_CONTEXT_KEY, context);
		return context;
	}

	get scales(): object | undefined {
		return this.#parts.scales();
	}

	get axes(): PlotAxes | undefined {
		return this.#parts.axes();
	}

	get data(): T[] {
		return this.#parts.data();
	}

	get width(): number {
		return this.#parts.size().width;
	}

	get height(): number {
		return this.#parts.size().height;
	}
}
