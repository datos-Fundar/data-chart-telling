import type { ChartConfig } from '$lib/types/configuration/styling';
import type { BinXTransform, MarkerTransform } from '$lib/types/transforms';

/**
 * The bin every histogram runs by default: counts per bin, with the configured
 * inset on each side of every bar. A plot's own `binX` is merged over it, its props winning.
 */
export function defaultBin(cfg: ChartConfig): BinXTransform {
	const { inset } = cfg.histogram;
	return { type: 'binX', y: 'count', insetLeft: inset, insetRight: inset };
}

/**
 * Merges the plot's own `binX` transforms over {@link defaultBin}, the
 * author's props winning, and keeps every other transform after it in order.
 * A histogram bins once, so several `binX` entries fold into one.
 */
export function mergeBin(own: MarkerTransform[], cfg: ChartConfig): MarkerTransform[] {
	const bins = own.filter((t): t is BinXTransform => t.type === 'binX');
	const others = own.filter((t) => t.type !== 'binX');
	const bin = bins.reduce<BinXTransform>((merged, t) => ({ ...merged, ...t }), defaultBin(cfg));
	return [bin, ...others];
}
