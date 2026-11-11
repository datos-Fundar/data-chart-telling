import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { BoxSummaries } from '$lib/plots/distribution/box/BoxSummaries';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import type { BoxPlotState } from '$lib/types/plots/distribution/box/state';
import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { ViolinProfiles } from '$lib/markers/violin/ViolinProfiles';
import type { ViolinPlotState, ViolinPlotEnv } from '$lib/types/plots/distribution/violin/state';
import type { ViolinPlotStylesConfig } from '$lib/types/plots/distribution/violin/props';
import type {
	AxisBasedMarkersConfig,
	BoxMarkerConfig,
	ViolinMarkerConfig
} from '$lib/types/markers/common';

/**
 * ViolinPlot's "markers" phase: one `violin` - and a narrow `box` over it - per visual
 * segment of each series, drawing a violin per category of its rows, filled with its series'
 * color (or its segment's own `fill`). Series share each category's band side
 * by side. The markers the "statistics" phase already put in `state.markers`
 * come after, so they render on top.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: ViolinPlotState<TData>,
	env: ViolinPlotEnv
): AxisBasedMarkersConfig[] {
	const processed = state.processedData;
	if (!processed) return [];
	const { cfg } = env;
	const styles = state.styles as ViolinPlotStylesConfig | undefined;
	const { channels } = processed;
	const groups = state.processedGroups ?? [];
	// Series share a band side by side only where they meet in it: one series per category - grouped by the category
	// itself - fills each band.
	const categoryOf = ProcessedPositions.of(processed, PlotAxes.valueOf(state))[
		PlotAxes.categoryOf(state)
	];
	const seriesIn = new Map<string, Set<unknown>>();
	for (const row of processed.data) {
		const key = String(categoryOf(row));
		seriesIn.set(key, (seriesIn.get(key) ?? new Set()).add(row[SERIES_KEY]));
	}
	const shared = [...seriesIn.values()].some((series) => series.size > 1);
	const slotOf = (index: number) => (shared ? { index, count: groups.length } : undefined);

	let peak: number | undefined;
	if (styles?.scale === 'shared') {
		const valueAxis = PlotAxes.valueOf(state);
		const position = ProcessedPositions.of(processed, valueAxis);
		const read = { category: position[PlotAxes.categoryOf(state)], value: position[valueAxis] };
		const estimate = { kernel: styles.kernel, bandwidth: styles.bandwidth, trim: styles.trim };
		peak = ViolinProfiles.peak(
			groups.flatMap((g) =>
				g.visualSegments.flatMap((s) => ViolinProfiles.of(s.data, read, estimate))
			)
		);
	}

	const boxWidth =
		styles?.box === false
			? undefined
			: typeof styles?.box === 'number'
				? styles.box
				: cfg.violin.boxWidth;
	const ink = 'currentColor';

	const violins = groups.flatMap((group, index) => {
		const name = group.series.name;
		const disabled = env.interaction?.fillFor(name);
		return group.visualSegments.map(
			(seg): ViolinMarkerConfig => ({
				type: 'violin',
				series: name,
				data: seg.data,
				x: channels.x as ViolinMarkerConfig['x'],
				y: channels.y as ViolinMarkerConfig['y'],
				kernel: styles?.kernel,
				bandwidth: styles?.bandwidth,
				trim: styles?.trim,
				peak,
				slot: slotOf(index),
				styles: {
					// An outline asked for without a color is the fill's.
					...(seg.styles.strokeWidth !== undefined
						? { stroke: disabled?.fill ?? seg.styles.fill ?? state.colorForSeries!(name) }
						: {}),
					...seg.styles,
					fill: disabled?.fill ?? seg.styles.fill ?? state.colorForSeries!(name),
					fillOpacity: disabled?.fillOpacity ?? seg.styles.fillOpacity ?? cfg.violin.fillOpacity
				}
			})
		);
	});

	// The box inside each violin: a narrow `box` marker in the axis color, its median a tick, with no outliers or caps.
	const boxes: BoxMarkerConfig[] =
		boxWidth === undefined
			? []
			: groups.flatMap((group, index) =>
					group.visualSegments.map(
						(seg): BoxMarkerConfig => ({
							type: 'box',
							series: group.series.name,
							data: seg.data,
							x: channels.x as BoxMarkerConfig['x'],
							y: channels.y as BoxMarkerConfig['y'],
							thickness: boxWidth,
							slot: slotOf(index),
							bar: { fill: ink, fillOpacity: 1 },
							rule: { stroke: ink, strokeWidth: 1.5 },
							dot: { r: 0 },
							tickMinMax: false
						})
					)
				);

	// The parts of each violin's box `styles.values` labels: its median by default, beside it, in its series' slot.
	const slots = new Map(groups.map((group, index) => [group.series.name, index]));
	const summaries = state as unknown as BoxPlotState<TData>;
	const labels = state.valueLabels?.show
		? state.valueLabels.partMarkers(
				env,
				BoxSummaries.of(summaries),
				// Beside the narrow box inside each violin, the violin itself as wide as its values are dense.
				ValueLabels.bandPoint(state, 'category', boxWidth ?? 0, (row) => {
					const index = slots.get(String(row[SERIES_KEY]));
					return index === undefined ? undefined : slotOf(index);
				}),
				{ seriesColor: (row) => state.colorForSeries!(String(row[SERIES_KEY])) }
			)
		: [];
	return [...violins, ...boxes, ...labels] as AxisBasedMarkersConfig[];
}
