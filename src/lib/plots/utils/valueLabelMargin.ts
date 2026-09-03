import { measureMaxLabelWidth } from '$lib/layout/plot/measureText';

/**
 * The one calculation every value-label-drawing plot (`LinePlot`, `BarPlot`,
 * `PyramidPlot`, …) needs to reserve margin for its own value labels ahead of
 * time, stable across a timeline scrubber or a dataset change: measure the
 * widest candidate label (already off-DOM/canvas via `measureMaxLabelWidth`,
 * so this is synchronous and exact, not an approximation needing a later
 * DOM-measured correction), then add a fixed `reach` — whatever fixed gap
 * sits between the anchor point and where the text itself starts, which
 * differs per plot (a bar/pyramid's anchor offset; a line's elbow-routed
 * lane geometry, see `laneReachUpperBound`).
 *
 * `texts` is the plot's own candidate list (its own concern — which values
 * count as "the widest this could ever need to be", e.g. every row's value
 * vs. just a pinned domain's extremes) — this function only measures and
 * combines, it never decides which labels matter.
 */
export function estimateValueLabelMargin(
	texts: string[],
	options: {
		/** Canvas font shorthand, e.g. `"12px sans-serif"`, matching the labels' own rendered font. */
		canvasFont: string;
		/**
		 * Fraction of the widest label's own width that extends toward the
		 * margin being reserved — `1` (the default) for a label anchored so
		 * its whole width reaches outward (`textAnchor: 'start'`), `0.5` for
		 * one centered on its anchor (`'middle'`), `0` for one anchored back
		 * over the plot's own content (no text-width contribution, though
		 * `reach` can still apply).
		 */
		textFraction?: number;
		/**
		 * Fixed gap (px) between the anchor point and the start of the label
		 * text — always reserved, even when `texts` is empty, matching every
		 * caller's existing behaviour of never collapsing to zero margin
		 * outright (a plot with no value-label-bearing data yet still keeps
		 * whatever fixed offset its style config asks for).
		 */
		reach?: number;
	}
): number {
	const maxWidth = measureMaxLabelWidth(texts, options.canvasFont);
	const textFraction = options.textFraction ?? 1;
	const reach = options.reach ?? 0;
	return Math.ceil(reach + textFraction * maxWidth);
}

/**
 * Upper bound on how far `LinePlot`'s end-of-line labels can ever fan out
 * into lanes (see `plots/utils/declutter.ts`'s `laneAssignment`): a run of
 * colliding labels never uses more lanes than it has members, and a run can
 * never have more members than there are series total — so `elbowGap +
 * (seriesCount - 1) * laneStep + labelGap` is always >= the real, rendered
 * reach, for *any* arrangement `declutter1D`/`laneAssignment` could ever
 * produce. That's what makes it safe to use as a stable floor: it doesn't
 * depend on which series happen to collide on the current frame (which can
 * change tick to tick as a timeline scrubs), only on how many series exist —
 * so the margin it implies never needs to change across a scrub either.
 */
export function laneReachUpperBound(
	seriesCount: number,
	cfg: { elbowGap: number; laneStep: number; labelGap: number }
): number {
	if (seriesCount <= 1) return 0;
	return cfg.elbowGap + (seriesCount - 1) * cfg.laneStep + cfg.labelGap;
}
