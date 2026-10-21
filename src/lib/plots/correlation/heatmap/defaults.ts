import { resolveColorScale } from '$lib/utils/color';
import { resolveOpacityScale } from '$lib/utils/opacity';
import { ContinuousDomain } from '$lib/utils/ContinuousDomain';
import { buildMarks, buildValueLabels } from '$lib/plots/correlation/heatmap/markers';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { HeatmapPlotState, HeatmapPlotCtx } from '$lib/types/plots/correlation/heatmap/state';

/**
 * HeatmapPlot's own "scales" output, over the band axes the shared phase laid
 * out: the color domain over every cell's value (when `color` is set), and each
 * row's own resolved color and opacity.
 */
function extendWithColorScales<TData extends Record<string, unknown>>(
	state: HeatmapPlotState<TData>,
	ctx: HeatmapPlotCtx
): HeatmapPlotState<TData> {
	const { scales, channels } = state;
	const { range, cfg } = ctx;
	const { color: colorAcc } = channels!;
	const rows = (state.processedData?.data ?? []) as TData[];

	const valueDomain = ContinuousDomain.build(
		scales.color?.domain,
		rows.map((d) => Number(colorAcc.accessor(d))),
		true
	) ?? [0, 1];

	// 'rescale' reprojects the ramp onto the narrowed range; 'filter' (and no
	// active range) keeps the original domain - only which cells are hidden
	// changes (resolved in the "markers" phase).
	const effectiveDomain = ContinuousDomain.ramp(valueDomain, range);

	const colorScale = resolveColorScale(
		{ ...scales.color, domain: effectiveDomain },
		effectiveDomain,
		[cfg.continuous.min, cfg.continuous.max]
	);
	const resolveColor = (row: TData) => colorScale(Number(colorAcc.accessor(row)));

	const opacityAcc = channels!.opacity;
	let opacityDomainOut: [number, number] | undefined;
	const resolveOpacity = opacityAcc
		? (() => {
				const rawVals = rows.map((d) => opacityAcc.accessor(d)).filter((v) => v != null);
				const allNumeric = rawVals.every((v) => Number.isFinite(Number(v)));
				const opacityDomain: [number, number] | string[] = allNumeric
					? rawVals.length
						? [Math.min(...rawVals.map(Number)), Math.max(...rawVals.map(Number))]
						: [0, 1]
					: [...new Set(rawVals.map(String))];
				if (allNumeric && rawVals.length) opacityDomainOut = opacityDomain as [number, number];
				const opacityScale = resolveOpacityScale(
					scales.opacity,
					opacityDomain,
					cfg.continuous.opacityRange
				);
				return (row: TData) => opacityScale(opacityAcc.accessor(row));
			})()
		: undefined;

	return {
		...state,
		scales: {
			...scales,
			...(colorAcc.source !== undefined ? { color: { ...scales.color, domain: valueDomain } } : {})
		},
		opacityDomain: opacityDomainOut,
		resolveColor,
		resolveOpacity
	};
}

/**
 * HeatmapPlot on the shared pipeline: both axes are categories. A heatmap's
 * `color` is each cell's numeric value, which the "data" phase reads as a
 * continuous channel rather than a grouping key: the rows stay one series, and
 * author markers don't inherit it. Its own band/color scales and markers; a
 * cell's tooltip names its coordinates and its value.
 * Its plot defaults to: hover one cell.
 */
export function buildHeatmapDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	HeatmapPlotState<TData>,
	HeatmapPlotCtx
> {
	return {
		data: { discreteAxes: 2 },
		mapping: {
			// A heatmap with no `color` still reads one per cell, as nothing.
			extend: (state) => ({
				...state,
				channels: {
					...state.channels!,
					color: state.channels!.color ?? { accessor: () => undefined }
				}
			})
		},
		statistics: { inheritGrouping: false },
		sharedScales: { fromScalesPhase: ['color'] },
		scales: {
			bandOrder: 'data',
			defaults: () => ({ x: { labelAnchor: 'right' } }),
			extend: extendWithColorScales
		},
		styles: { values: { show: true } },
		markers: { marks: buildMarks, valueLabels: buildValueLabels },
		hover: {
			// A hovered cell reads as its formatted value.
			label: (state) => {
				const format = state.values?.format ?? ((v: number) => `${v}`);
				const color = state.channels!.color.accessor;
				return ((row: TData) => format(Number(color(row)), '')) as (row: never) => string;
			},
			// A cell's color is its value, not a series'.
			decorate: () => () => ({ series: undefined, color: undefined })
		}
	};
}
