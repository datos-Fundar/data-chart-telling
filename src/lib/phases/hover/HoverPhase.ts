import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { GAP_VALUE, SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { HoverSettings } from '$lib/layout/hover/HoverSettings';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { HoverDisplayPoint, HoverPoint } from '$lib/types/layout/hover';
import type { TooltipConfig } from '$lib/types/plots/props';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import type {
	AxisPlotCtx,
	AxisPlotState,
	HoverPosition,
	HoverStageOptions,
	PhaseStage,
	ProcessedData,
	ProcessedRow
} from '$lib/types/phases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisState = AxisPlotState<any, any, any, any>;
type Row = Record<string, unknown>;

/**
 * The "hover" phase every axis-based plot shares: what the pointer can match
 * (`hover`), the rows it hovers over (`hoverRows`) and where each sits
 * (`hoverPosition`). Candidates are the processed rows (or the kind's own
 * hover `rows`) of the series the legend shows, except gap rows and rows
 * outside the legend's narrowed range.
 */
export class HoverPhase<
	TState extends AnyAxisState,
	TCtx extends AxisPlotCtx
> implements PhaseStage<TState, TCtx> {
	readonly phase = 'hover' as const;
	readonly #options: HoverStageOptions<TState, TCtx>;

	constructor(options: HoverStageOptions<TState, TCtx> = {}) {
		this.#options = options;
	}

	run = (state: TState, ctx: TCtx): TState => {
		const options = this.#options;
		const valueAxis = PlotAxes.valueOf(state);
		const raw =
			options.position?.(state) ??
			(ProcessedPositions.of(state.processedData!, valueAxis) as HoverPosition);
		// A processed position reads as raw; the hover controller and the plot's
		// scales want its value as a number, unless that axis lays out categories.
		const position: HoverPosition =
			options.position || state.axes?.isDiscrete(valueAxis)
				? raw
				: { ...raw, [valueAxis]: (row: never) => Number(raw[valueAxis](row)) };
		const label =
			options.label?.(state) ??
			((row: never) => String(state.channels![valueAxis].accessor(row as Row)));
		const processed: ProcessedData = options.rows
			? { ...state.processedData!, data: options.rows(state) }
			: state.processedData!;
		const points = HoverPhase.buildProcessedHoverPoints<Row>({
			processed,
			colorFor: state.colorForSeries!,
			legendInteraction: ctx.interaction?.legend,
			label: label as (row: Row) => string,
			position,
			include: HoverPhase.#hoverable(state, ctx, raw, valueAxis),
			row: options.row?.(state) as ((row: Row) => Row) | undefined,
			decorate: options.decorate?.(state, ctx) as
				| ((row: Row) => Partial<HoverDisplayPoint>)
				| undefined
		});
		const hover = HoverSettings.buildConfig<Row>({
			tooltip: state.tooltip as TooltipConfig<Row> | undefined,
			format:
				(options.format?.(state) as ((row: Row) => string) | undefined) ?? state.tooltipFormat!,
			sort:
				(options.sort?.(state) as ((a: Row, b: Row) => number) | undefined) ?? state.tooltipSort,
			markers: state.authorMarkers ?? [],
			points: points as HoverPoint<Row>[],
			label: label as (row: Row) => string,
			defaultStrategy: options.strategy ?? HoverSettings.strategyOf(state.axes),
			pointMatching: options.pointMatching
		});
		const hitAreas = options.hitAreas?.(state, hover as never, ctx) ?? [];
		return {
			...state,
			hover,
			hoverPosition: position,
			hoverRows: processed.data,
			...(hitAreas.length > 0 ? { markers: [...(state.markers ?? []), ...hitAreas] } : {})
		};
	};

	/**
	 * Hover candidates for a plot's own processed rows: each visible row at its
	 * position (a stacked row's top, a bin's centre), in its series' color. A
	 * series the legend turned off is left out, as is any row `include` rejects.
	 */
	static buildProcessedHoverPoints<TRow extends Record<string, unknown>>(args: {
		processed: ProcessedData;
		colorFor: (seriesName: string) => string;
		legendInteraction?: LegendState | null;
		label: (row: TRow) => string;
		include?: (row: TRow) => boolean;
		/** The row a hovered point reads as, e.g. with derived fields added. Defaults to the processed row. */
		row?: (row: TRow) => TRow;
		/** Fields to add to (or replace on) each point. */
		decorate?: (row: TRow) => Partial<HoverDisplayPoint>;
		/** Where a row sits, as is. Defaults to its processed position, with `y` as a number. */
		position?: HoverPosition;
	}): HoverPoint<TRow>[] {
		const { processed, colorFor, legendInteraction, label, include, row: rowOf, decorate } = args;
		const processedPosition = ProcessedPositions.of(processed);
		const position = args.position ?? {
			x: processedPosition.x,
			y: (row: never) => Number(processedPosition.y(row as ProcessedRow))
		};
		const x = position.x as (row: ProcessedRow) => unknown;
		const y = position.y as (row: ProcessedRow) => unknown;
		return processed.data
			.filter((d: ProcessedRow) => !legendInteraction?.isOff(d[SERIES_KEY] as string))
			.filter((d) => !include || include(d as TRow))
			.map((d) => {
				const row = d as TRow;
				const seriesName = d[SERIES_KEY] as string;
				return {
					x: x(d) as AxisValue,
					y: y(d) as AxisValue,
					row: rowOf ? rowOf(row) : row,
					label: label(row),
					series: seriesName,
					color: colorFor(seriesName),
					...decorate?.(row)
				};
			});
	}

	/**
	 * Which processed rows can be hovered: not a gap (no value where it sits, or
	 * filled in by `styles.gaps`), and, while the legend narrows a continuous
	 * color to a range, not outside it. A dimmed row stays drawn, never matched.
	 */
	static #hoverable(
		state: AnyAxisState,
		ctx: AxisPlotCtx,
		position: HoverPosition,
		valueAxis: 'x' | 'y'
	): (row: Row) => boolean {
		const range = ctx.interaction?.legend?.range;
		const color = state.channels?.color?.accessor;
		return (row) => {
			if (isGapValue(position[valueAxis](row as never)) || row[GAP_VALUE] !== undefined)
				return false;
			return !range || !color || LegendState.inRange(Number(color(row as never)), range);
		};
	}
}
