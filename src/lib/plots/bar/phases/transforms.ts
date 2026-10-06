import { buildTransforms as buildSharedTransforms } from '$lib/layout/phases/transforms';
import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';
import type {
	ProcessedChannel,
	ProcessedRow,
	TransformsStageOptions
} from '$lib/types/layout/phases';

/** The field a gap-filled row carries its interpolated value under, for the transforms to read. */
const GAP_VALUE = '__gapValue';

/**
 * BarPlot's options for the shared "transforms" stage: every gap `styles.gaps`
 * fills is read at its interpolated value — so a filled gap takes its place
 * in a stack, the way a real value would.
 */
export function buildBarTransformsOptions<
	TData extends Record<string, unknown>
>(): TransformsStageOptions<BarPlotState<TData>, BarPlotCtx> {
	return {
		tagRow: (row, series, state) => {
			const fill = state.gapFillMaps?.get(series.name)?.get(row);
			return fill ? { [GAP_VALUE]: fill.value } : {};
		},
		y: (y: ProcessedChannel, state) => {
			const hasFills = [...(state.gapFillMaps?.values() ?? [])].some((fills) => fills.size > 0);
			if (!hasFills) return y;
			const read = resolveAccessor(y as never) as (row: ProcessedRow) => unknown;
			return (row: ProcessedRow) => row[GAP_VALUE] ?? read(row);
		}
	};
}

/** BarPlot's "transforms" phase: the shared one, with {@link buildBarTransformsOptions}. */
export function buildTransforms<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>,
	ctx: BarPlotCtx
): BarPlotState<TData> {
	return buildSharedTransforms(buildBarTransformsOptions<TData>())(state, ctx);
}
