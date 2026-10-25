import { buildMarks as buildBarMarks, buildBarGeometry } from '$lib/plots/ranking/bar/markers';
import { GAP_VALUE } from '$lib/phases/transforms/TransformsPhase';
import { RowNumbers } from '$lib/plots/utils/RowNumbers';
import type {
	AxisBasedMarkersConfig,
	BarMarkerConfig,
	RuleMarkerConfig,
	TickMarkerConfig
} from '$lib/types/markers/common';
import type { BulletStylesConfig } from '$lib/types/layout/styles';
import type { BulletPlotState, BulletPlotCtx } from '$lib/types/plots/ranking/bullet/state';

/** One drawn category: where it sits and what it is measured against. */
type Measure = { category: unknown; target?: number; bounds: number[] };

/** Each category's target and range bounds, read off the rows the bars draw. */
function buildMeasures<TData extends Record<string, unknown>>(
	state: BulletPlotState<TData>,
	ctx: BulletPlotCtx
): Measure[] {
	const geometry = buildBarGeometry(state, ctx.cfg.bar.seriesPadding);
	return (state.processedData?.data ?? [])
		.filter((row) => row[GAP_VALUE] === undefined && geometry.spanOf(row) !== undefined)
		.map((row) => ({
			category: geometry.categoryOf(row),
			target: RowNumbers.of(state.target, row),
			bounds: (state.ranges ?? [])
				.map((range) => RowNumbers.of(range, row))
				.filter((bound): bound is number => bound !== undefined)
				.sort((a, b) => a - b)
		}));
}

/** Every value the axis has to reach beyond the bars. */
export function buildReach<TData extends Record<string, unknown>>(
	state: BulletPlotState<TData>,
	ctx: BulletPlotCtx
): number[] {
	return buildMeasures(state, ctx).flatMap(({ target, bounds }) => [
		...(target === undefined ? [] : [target]),
		...bounds
	]);
}

/**
 * BulletPlot's "markers" phase, back to front: a rule per range, the bars of a
 * bar plot - thinner, so the ranges show around them - and a tick at each
 * target.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: BulletPlotState<TData>,
	ctx: BulletPlotCtx
): AxisBasedMarkersConfig[] {
	const configured = ctx.cfg.bullet;
	const own = (state.styles ?? {}) as BulletStylesConfig;
	const rangeColors = own.ranges?.colors ?? configured.rangeColors;
	const rangeWidth = own.ranges?.width ?? configured.rangeWidth;
	const target = {
		color: own.target?.color ?? configured.targetColor ?? ctx.cfg.axis.color,
		width: own.target?.width ?? configured.targetWidth,
		length: own.target?.length ?? configured.targetLength
	};
	const isHorizontal = state.axes?.isHorizontal ?? false;
	const baseline = buildBarGeometry(state, ctx.cfg.bar.seriesPadding).baseline;
	const measures = buildMeasures(state, ctx);

	// Each bound is a band from the baseline, drawn widest first so the narrower ones lie over it.
	const rows = measures.flatMap(({ category, bounds }) =>
		bounds
			.map((bound, rank) => ({
				category,
				from: baseline,
				to: bound,
				stroke: rangeColors[Math.min(rank, rangeColors.length - 1)]
			}))
			.reverse()
	);
	const ranges: RuleMarkerConfig[] =
		rows.length === 0
			? []
			: [
					{
						type: 'rule',
						legend: false,
						axis: isHorizontal ? 'y' : 'x',
						data: rows,
						value: 'category',
						...(isHorizontal ? { x1: 'from', x2: 'to' } : { y1: 'from', y2: 'to' }),
						stroke: 'stroke',
						styles: { strokeWidth: rangeWidth }
					}
				];

	// The bars narrowed to a thickness of their own, centered in their band.
	const bars = buildBarMarks(state, ctx).map((marker) =>
		marker.type === 'bar' && marker.role === 'segment'
			? ({
					...marker,
					thickness: own.bar?.thickness ?? configured.barThickness
				} as BarMarkerConfig)
			: marker
	);

	const targets = measures.flatMap(({ category, target }) =>
		target === undefined ? [] : [{ category, end: target }]
	);
	const ticks: TickMarkerConfig[] =
		targets.length === 0
			? []
			: [
					{
						type: 'tick',
						legend: false,
						data: targets,
						...(isHorizontal ? { x: 'end', y: 'category' } : { x: 'category', y: 'end' }),
						tickLength: target.length,
						styles: {
							stroke: target.color,
							strokeWidth: target.width
						}
					}
				];
	return [...ranges, ...bars, ...ticks];
}
