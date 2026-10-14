import { buildMarks, buildValueLabels } from '$lib/plots/scatter/markers';
import { TransformsPhase } from '$lib/phases/transforms/TransformsPhase';
import { Margins } from '$lib/layout/margins/Margins';
import { MarkerAxisValues } from '$lib/phases/scales/MarkerAxisValues';
import type { AxisScale } from '$lib/types/layout/scales';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/scatter/state';

/** Stand-in max render radius for a channel-bound `r` (svelteplot's own auto sqrt scale). */
const AUTO_SCALED_RADIUS_ESTIMATE = 20;

/**
 * `values`' extent widened by `radiusPx` of data on each side, over a plot
 * `sizePx` wide, so the largest dot doesn't clip the frame. All-equal values
 * widen by a unit instead.
 */
function paddedDomain(values: number[], radiusPx: number, sizePx: number): [number, number] | undefined {
	const finite = values.filter((v) => Number.isFinite(v));
	if (finite.length === 0) return undefined;
	const min = Math.min(...finite);
	const max = Math.max(...finite);
	if (min === max) return [min - 1, max + 1];
	const pad = sizePx > 0 ? (radiusPx * (max - min)) / sizePx : 0;
	return [min - pad, max + pad];
}

/**
 * The domains a scatter fits to its own dots: each unpinned axis padded by
 * the largest dot's radius, and grown to cover what derived markers draw
 * (a density curve's peak, a regression band).
 */
function fitDomains<TData extends Record<string, unknown>>(
	state: ScatterPlotState<TData>,
	ctx: ScatterPlotCtx
): Partial<Record<'x' | 'y', Partial<AxisScale<TData>>>> {
	const { scales, channels, groupedSeries } = state;
	const processed = state.processedData!;
	const position = TransformsPhase.processedPosition(processed);
	const extra = { x: MarkerAxisValues.of(state.markers ?? [], 'x'), y: MarkerAxisValues.of(state.markers ?? [], 'y') };
	// The largest radius a dot renders at, from the `r` channel and segment styles.
	const r = channels!.r;
	const radius =
		typeof r === 'number'
			? r
			: r !== undefined
				? AUTO_SCALED_RADIUS_ESTIMATE
				: Math.max(
						0,
						...groupedSeries!.flatMap((group) =>
							group.visualSegments.map((seg) => seg.styles.dotRadius ?? ctx.cfg.scatter.dotRadius)
						)
					);
	if (radius <= 0 && !extra.x.length && !extra.y.length) return {};
	const box = Margins.resolve({ ...ctx.cfg.margins, ...state.margins }).contentBox(
		state.width,
		state.height
	);
	const fit: Partial<Record<'x' | 'y', Partial<AxisScale<TData>>>> = {};
	for (const [axis, size] of [['x', box.width], ['y', box.height]] as const) {
		if (scales[axis]?.domain) continue;
		const values = [...processed.data.map((d) => Number(position[axis](d))), ...extra[axis]];
		const domain = paddedDomain(values, radius, size);
		if (domain) fit[axis] = { domain };
	}
	return fit;
}

/** ScatterPlot on the shared pipeline: discrete dots, its own radius-padded scales, and its own markers. Its plot defaults to: hover the exact point. */
export function buildScatterDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	ScatterPlotState<TData>,
	ScatterPlotCtx
> {
	return {
		data: {
			segments: {
				color: (style: ScatterSegmentStyle | undefined) => style?.dotFill,
				connect: false
			}
		},
		scales: { fit: fitDomains },
		markers: { marks: buildMarks, valueLabels: buildValueLabels },
		hover: {
			strategy: 'punctual',
			label: (state) => {
				const { x, y } = state.channels!;
				return (row: never) => `${x.accessor(row)}, ${y.accessor(row)}`;
			}
		}
	};
}
