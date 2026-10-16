import { PublicFigureContext, PublicPlotContext } from '$lib/layout/plot/PublicPlotContext';

/**
 * What the plot around the calling component is: its hover, its figure's
 * legend and timeline, margins, scales, rows and box, and svelteplot's own state as
 * `svelteplot`. Call it during init, in anything drawn inside a plot.
 */
export function usePlot<
	T extends Record<string, unknown> = Record<string, unknown>
>(): PublicPlotContext<T> {
	return PublicPlotContext.use<T>();
}

/** What the figure around the calling component is: its hover, legend and timeline. Call it during init, anywhere inside a figure - its chrome too. */
export function useFigure(): PublicFigureContext {
	return PublicFigureContext.use();
}
