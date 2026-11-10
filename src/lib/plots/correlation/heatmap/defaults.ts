import { ColorRamp } from '$lib/utils/color';
import { HoverDefaults } from '$lib/layout/hover/HoverDefaults';
import { OpacityScale } from '$lib/utils/OpacityScale';
import { ContinuousDomain } from '$lib/utils/ContinuousDomain';
import { buildMarks } from '$lib/plots/correlation/heatmap/markers';
import { RowContext } from '$lib/phases/context/RowContext';
import type { AxisPlotDefaults, ProcessedRow } from '$lib/types/phases';
import type { HeatmapPlotState, HeatmapPlotEnv } from '$lib/types/plots/correlation/heatmap/state';

/**
 * HeatmapPlot's own "scales" output, over the band axes the shared phase laid
 * out: the color domain over every cell's value (when `color` is set), and each
 * row's own resolved color and opacity.
 */
function extendWithColorScales<TData extends Record<string, unknown>>(
	state: HeatmapPlotState<TData>,
	env: HeatmapPlotEnv
): HeatmapPlotState<TData> {
	const { scales, channels } = state;
	const { range, cfg } = env;
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

	const colorScale = ColorRamp.continuous(cfg, scales.color, effectiveDomain);
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
				const opacityScale = OpacityScale.resolve(
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
	HeatmapPlotEnv
> {
	return {
		data: { discreteAxes: 2, segments: { base: { flat: 'area' } } },
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
		// A cell's value is its color's, not a position's.
		context: (state) => {
			const color = state.channels!.color.accessor;
			return ((row: TData) => {
				const value = Number(color(row as never));
				return { value: Number.isFinite(value) ? value : undefined };
			}) as (row: never) => object;
		},
		statistics: { inheritGrouping: false },
		sharedScales: { fromScalesPhase: ['color'] },
		scales: {
			bandOrder: 'data',
			defaults: () => ({ x: { labelAnchor: 'right' } }),
			extend: extendWithColorScales
		},
		transforms: { labels: { show: true } },
		styles: {
			values: {
				show: true,
				layout: 'box',
				layouts: { path: { edge: 'top', side: 'inside' }, point: { anchor: 'top', side: 'above' } }
			}
		},
		markers: { marks: buildMarks },
		hover: {
			// A cell writes its own value: the hover only restyles the cells - the hovered one outlined.
			marker: (_state, env) => HoverDefaults.shapes(env.cfg),
			// A hovered cell reads as its value, as its value labels write it.
			label: (state) => {
				const format = state.values?.format;
				const number = (v: number) => `${v}`;
				return ((row: ProcessedRow) => {
					const context = RowContext.of(row);
					return format ? format(Number(context.value), number, context) : `${context.value}`;
				}) as (row: never) => string;
			},
			// A cell's color is its value, not a series'.
			decorate: () => () => ({ series: undefined, color: undefined })
		}
	};
}
