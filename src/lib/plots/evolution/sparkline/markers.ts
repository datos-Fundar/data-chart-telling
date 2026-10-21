import { getConfiguration } from '$lib/configuration/config.svelte';
import { buildLineMarkers } from '$lib/plots/evolution/line/markers';
import { resolveAccessor } from '$lib/utils/accessors';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { CurveAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { AxisBasedMarkersConfig, DotMarkerConfig } from '$lib/types/markers/common';
import type {
	SparklinePlotState,
	SparklinePlotCtx
} from '$lib/types/plots/evolution/sparkline/state';

/**
 * SparklinePlot's "markers" phase: each series' line, thin, and a dot on its
 * last point with a value.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: SparklinePlotState<TData>,
	ctx: SparklinePlotCtx
): AxisBasedMarkersConfig[] {
	const { sparkline } = getConfiguration();
	const groups = state.processedGroups ?? [];
	const disabledDotsFor = (name: string) => ctx.interaction?.dotsFor(name);
	const lines = buildLineMarkers({
		groupedSeries: groups.map((group) => ({
			...group,
			visualSegments: group.visualSegments.map((segment) => ({
				...segment,
				styles: {
					...segment.styles,
					stroke: { strokeWidth: sparkline.strokeWidth, ...segment.styles.stroke }
				}
			}))
		})),
		colorFor: state.colorForSeries!,
		disabledStrokeFor: (name) => ctx.interaction?.strokeFor(name),
		disabledDotsFor,
		curve: (state.styles as CurveAwarePlotStylesConfig | undefined)?.curve
	});

	const dots = groups.flatMap((group): DotMarkerConfig[] => {
		const { series } = group;
		const value = resolveAccessor(series.y as never) as (row: unknown) => unknown;
		const last = [...series.data].reverse().find((row) => !isGapValue(value(row)));
		if (last === undefined) return [];
		// The dot takes the color of the stretch it ends.
		const color =
			group.visualSegments.at(-1)?.styles.stroke?.stroke ?? state.colorForSeries!(series.name);
		const disabled = disabledDotsFor(series.name);
		return [
			{
				type: 'dot',
				data: [last],
				x: series.x as string | ((d: TData) => AxisValue),
				y: series.y as string | ((d: TData) => AxisValue),
				styles: {
					dotRadius: sparkline.dotRadius,
					dotFill: color,
					dotStroke: color,
					dotStrokeWidth: 1,
					dotFillOpacity: disabled?.dotFillOpacity ?? 1,
					dotStrokeOpacity: disabled?.dotStrokeOpacity ?? 1
				}
			}
		];
	});
	return [...lines, ...dots];
}
