import { measureMaxLabelWidth } from '$lib/layout/base/measureText';
import type { LineAnchor } from '$lib/types/plots/constants';

/** Margin a plot reserves for its value labels: the widest of `texts`, plus a fixed `reach`. */
export function estimateValueLabelMargin(
	texts: string[],
	options: {
		/** Canvas font shorthand, e.g. `"12px sans-serif"`, matching the labels' own rendered font. */
		canvasFont: string;
		/** Share of the widest label's width that reaches into the margin: `1` (default), `0.5` centred, `0` none. */
		textFraction?: number;
		/** Fixed gap (px) between the anchor and the label text, reserved even with no `texts`. */
		reach?: number;
	}
): number {
	const maxWidth = measureMaxLabelWidth(texts, options.canvasFont);
	const textFraction = options.textFraction ?? 1;
	const reach = options.reach ?? 0;
	return Math.ceil(reach + textFraction * maxWidth);
}

/** Estimated full rendered height of a single-line value label at `fontSize`. */
export function estimateLabelHeight(fontSize: number): number {
	return fontSize * 1.2;
}

/** Vertical analogue of `estimateValueLabelMargin`: how far a value label's text extends above/below its anchor point. */
export function estimateValueLabelVerticalMargin(options: {
	fontSize: number;
	lineAnchor: LineAnchor;
	/** Pixel offset from the anchor point to the label's line-anchor edge, same sign as SVG's `dy`. */
	dy?: number;
}): { top: number; bottom: number } {
	const height = estimateLabelHeight(options.fontSize);
	const dy = options.dy ?? 0;
	if (options.lineAnchor === 'top') {
		return { top: 0, bottom: Math.ceil(Math.max(0, dy) + height) + 2 };
	}
	if (options.lineAnchor === 'bottom') {
		return { top: Math.ceil(Math.max(0, -dy) + height) + 2, bottom: 0 };
	}
	const half = height / 2;
	return {
		top: Math.ceil(Math.max(0, half - dy)) + 2,
		bottom: Math.ceil(Math.max(0, half + dy)) + 2
	};
}

/** Upper bound on how far `LinePlot`'s end-of-line labels can fan out into lanes. */
export function laneReachUpperBound(
	seriesCount: number,
	cfg: { elbowGap: number; laneStep: number; labelGap: number }
): number {
	if (seriesCount <= 1) return 0;
	return cfg.elbowGap + (seriesCount - 1) * cfg.laneStep + cfg.labelGap;
}
