import { usePlot as usePlotFromSvelteplot } from 'svelteplot';
import { HoverState } from '$lib/layout/hover/HoverState.svelte';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { PlotContext } from '$lib/layout/plot/PlotContext';
import type { PlotHover } from '$lib/layout/hover/PlotHover.svelte';
import type { Margins } from '$lib/layout/margins/Margins';
import type { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { HoverPoint, HoverStrategy } from '$lib/types/layout/hover';
import type { LegendDisabledAction, LegendEntry, LegendRange } from '$lib/types/layout/legend';

/** What the pointer is over, shared by every plot in a figure. Read-only. */
export class PublicHover {
	readonly #state: HoverState;

	constructor(state: HoverState) {
		this.#state = state;
	}

	/** The hovered x, or `null` while nothing is hovered. */
	get activeX(): AxisValue | null {
		return this.#state.activeX;
	}

	get activeY(): AxisValue | null {
		return this.#state.activeY;
	}

	/** The hovered row's series, when its plot has one. */
	get activeSeries(): string | null {
		return this.#state.activeSeries;
	}

	/** How related points are found: by x, y, series or exact position. */
	get strategy(): HoverStrategy {
		return this.#state.strategy;
	}

	/** Whether a plot's hover shows in the others. */
	get sync(): boolean {
		return this.#state.sync;
	}

	/** The id of the plot (facet panel or composer cell) that owns the hover, or `null`. */
	get source(): string | null {
		return this.#state.source;
	}
}

/** One plot's hover: the figure's, seen from the plot, with the points it highlights and its tooltip. Read-only. */
export class PublicPlotHover<T extends Record<string, unknown>> extends PublicHover {
	readonly #hover: PlotHover<T>;

	constructor(hover: PlotHover<T>) {
		super(hover.state);
		this.#hover = hover;
	}

	/** The points the hover highlights in this plot. */
	get points(): HoverPoint<T>[] {
		return this.#hover.points as HoverPoint<T>[];
	}

	/** The highlighted point under the cursor, or `null`. */
	get activePoint(): HoverPoint<T> | null {
		return this.#hover.activePoint;
	}

	/** The plot's tooltip: whether it shows, where, and the rows it reads. */
	get tooltip(): { visible: boolean; position: { x: number; y: number } | null; rows: T[] } {
		const position = this.#hover.tooltipPosition;
		return {
			visible: this.#hover.showTooltip && position != null,
			position,
			rows: this.#hover.matchedRows.map((point) => point.row)
		};
	}
}

/** A figure's legend: what is on it and which series are off, which a user can turn on and off too. */
export class PublicLegend {
	readonly #state: LegendState;

	constructor(state: LegendState) {
		this.#state = state;
	}

	/** Everything the figure's plots draw on the legend. */
	get entries(): LegendEntry[] {
		return this.#state.entries;
	}

	/** The range its continuous section narrows to, or `null`. */
	get range(): LegendRange | null {
		return this.#state.range;
	}

	/** The series that are turned off. */
	get off(): string[] {
		return [...this.#state.disabled.keys()];
	}

	isOff(series: string): boolean {
		return this.#state.isOff(series);
	}

	turnOff(series: string, action: LegendDisabledAction): void {
		this.#state.turnOff(series, action);
	}

	turnOn(series: string): void {
		this.#state.turnOn(series);
	}

	toggle(series: string, action: LegendDisabledAction): void {
		this.#state.toggle(series, action);
	}
}

/** What anything inside a figure - its chrome included - can read of it. */
export class PublicFigureContext {
	readonly hover: PublicHover;
	readonly legend: PublicLegend | null;

	constructor(hover: HoverState, legend: LegendState | null) {
		this.hover = new PublicHover(hover);
		this.legend = legend && new PublicLegend(legend);
	}

	/** The enclosing figure's context. Call during component init, below a figure. */
	static use(): PublicFigureContext {
		const hover = HoverState.current();
		if (!hover) throw new Error('useFigure() must be called inside a figure (a plot or a PlotComposer).');
		return new PublicFigureContext(hover, LegendState.current());
	}
}

/**
 * What anything drawn inside a plot can read of it: its hover, its figure's
 * legend, margins, scales, axes, rows and box - and svelteplot's own plot state,
 * apart as `svelteplot`. Read-only, but for the legend.
 */
export class PublicPlotContext<T extends Record<string, unknown> = Record<string, unknown>> {
	readonly hover: PublicPlotHover<T>;
	readonly legend: PublicLegend | null;
	/** svelteplot's own state for this plot: its scales, options and size. */
	readonly svelteplot: ReturnType<typeof usePlotFromSvelteplot>;
	readonly #context: PlotContext<T>;

	constructor(context: PlotContext<T>, svelteplot: ReturnType<typeof usePlotFromSvelteplot>) {
		this.#context = context;
		this.hover = new PublicPlotHover(context.hover);
		this.legend = context.legend && new PublicLegend(context.legend);
		this.svelteplot = svelteplot;
	}

	/** The enclosing plot's context. Call during component init, below a plot's `BasePlotLayout`. */
	static use<T extends Record<string, unknown> = Record<string, unknown>>(): PublicPlotContext<T> {
		const context = PlotContext.current();
		if (!context) throw new Error('usePlot() must be called inside a plot.');
		return new PublicPlotContext(context as PlotContext<T>, usePlotFromSvelteplot());
	}

	/** The margins around the plot's content box. */
	get margins(): Margins {
		return this.#context.margins.numeric;
	}

	/** The plot's scales as its kind built them. */
	get scales(): object | undefined {
		return this.#context.scales;
	}

	/** What the plot's position channels are and which way it runs - `undefined` for a plot with no axes (a map). */
	get axes(): PlotAxes | undefined {
		return this.#context.axes;
	}

	/** The rows the plot draws and hovers over. */
	get data(): T[] {
		return this.#context.data;
	}

	get width(): number {
		return this.#context.width;
	}

	get height(): number {
		return this.#context.height;
	}
}
