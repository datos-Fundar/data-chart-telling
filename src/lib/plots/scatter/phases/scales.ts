import { numericMargin } from '$lib/layout/plot/margins';
import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/scatter/state';

/** Stand-in max render radius for a channel-bound `r` (svelteplot's own auto sqrt scale). */
const AUTO_SCALED_RADIUS_ESTIMATE = 20;

/**
 * Extends a `[min, max]` data domain so the largest rendered dot radius
 * doesn't get clipped by the plot's own frame — svelteplot's own `'auto'`
 * margin only measures axis chrome (tick labels), never mark geometry.
 * `innerSizePx` is an estimate (the real pixel range isn't known until the
 * scale itself is built from this domain), so this errs generous rather
 * than exact.
 */
export function resolveRadiusPaddedDomain(
	values: number[],
	maxRadiusPx: number,
	innerSizePx: number
): [number, number] | undefined {
	const finite = values.filter((v) => Number.isFinite(v));
	if (finite.length === 0 || innerSizePx <= 0 || maxRadiusPx <= 0) return undefined;
	const min = Math.min(...finite);
	const max = Math.max(...finite);
	if (min === max) {
		// A degenerate single-value domain has no data-per-pixel ratio to pad by — fall back to a fixed unit either side.
		return [min - 1, max + 1];
	}
	const dataPerPixel = (max - min) / innerSizePx;
	const pad = maxRadiusPx * dataPerPixel;
	return [min - pad, max + pad];
}

/** ScatterPlot's "scales" phase: resolved x/y scales, domain-padded so the largest rendered dot doesn't clip the frame. */
export function buildScales<TData extends Record<string, unknown>>(
	state: ScatterPlotState<TData>,
	ctx: ScatterPlotCtx
): ScatterPlotState<TData> {
	const { scales, flat, channels, groupedSeries, width, height, margins } = state;
	const { cfg } = ctx;

	// The largest radius any dot will actually render at — estimated from the
	// resolved `r` channel and each segment's own style, not from built
	// markers (this phase runs before "markers").
	const r = channels!.r;
	const maxDotRadius =
		typeof r === 'number'
			? r
			: r !== undefined
				? AUTO_SCALED_RADIUS_ESTIMATE
				: groupedSeries!.reduce(
						(max, group) =>
							group.visualSegments.reduce(
								(segMax, seg) => Math.max(segMax, seg.style.dotRadius ?? cfg.scatter.dotRadius),
								max
							),
						0
					);
	if (maxDotRadius <= 0) return { ...state, scales };

	// Pre-render estimate of the plot's own inner content size.
	const estimatedMargins = { ...cfg.margins, ...margins };
	const estimatedInnerWidth =
		width -
		numericMargin('left', estimatedMargins.left) -
		numericMargin('right', estimatedMargins.right);
	const estimatedInnerHeight =
		height -
		numericMargin('top', estimatedMargins.top) -
		numericMargin('bottom', estimatedMargins.bottom);

	const xAcc = channels!.x.accessor;
	const yAcc = channels!.y.accessor;
	const xValues = flat!.map((d) => Number(xAcc(d)));
	const yValues = flat!.map((d) => Number(yAcc(d)));
	const paddedX = scales.x?.domain
		? undefined
		: resolveRadiusPaddedDomain(xValues, maxDotRadius, estimatedInnerWidth);
	const paddedY = scales.y?.domain
		? undefined
		: resolveRadiusPaddedDomain(yValues, maxDotRadius, estimatedInnerHeight);
	if (!paddedX && !paddedY) return { ...state, scales };

	return {
		...state,
		scales: {
			...scales,
			x: paddedX ? { ...scales.x, domain: paddedX } : scales.x,
			y: paddedY ? { ...scales.y, domain: paddedY } : scales.y
		}
	};
}
