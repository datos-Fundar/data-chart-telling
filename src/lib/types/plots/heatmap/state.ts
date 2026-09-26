import type { Series, Accessor } from '$lib/types/plots/data/common';
import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
import type { ResolvedChannel } from '$lib/types/layout/mapping';
import type { ChartConfig } from '$lib/types/configuration/styling';
import type { CellMarkerConfig } from '$lib/types/markers/common';
import type { LegendDisabledStyle } from '$lib/types/layout/legend';

/**
 * The active continuous-legend range filter, if any — narrows which cells
 * render at full opacity, and in `'rescale'` mode, the color domain itself.
 */
export type HeatmapRangeFilter = {
	min: number;
	max: number;
	mode: 'rescale' | 'filter';
	disabledStyle: LegendDisabledStyle;
};

/** HeatmapPlot's shared pipeline state — raw props plus every phase's own output. */
export type HeatmapPlotState<TData extends Record<string, unknown>> = {
	series?: Series<TData>[];
	data?: TData[];
	x?: Accessor<TData, AxisValue>;
	y?: Accessor<TData, AxisValue>;
	/** Color-value accessor — a pre-built `series` entry carries this as its own `.color` too (see `Series`). */
	color?: Accessor<TData, unknown>;
	/** Continuous or categorical opacity-value accessor — see `DataProps.opacity`. */
	opacity?: Accessor<TData, unknown>;
	segments: SegmentsConfig<CellSegmentStyle>;
	scales: AxisBasedScalesConfig<TData>;
	width: number;
	height: number;
	margins?: MarginConfig;

	// "data" phase output.
	resolvedSeries?: Series<TData>[];
	flat?: TData[];

	// "mapping" phase output.
	channels?: {
		x: ResolvedChannel<TData>;
		y: ResolvedChannel<TData>;
		color: ResolvedChannel<TData, unknown>;
		/** Row-level accessor resolved from `opacity`, when set. */
		opacity?: ResolvedChannel<TData, unknown>;
	};

	/** "scales" phase output: each row's own resolved color, composed from `channels.color` and the color ramp. */
	resolveColor?: (row: TData) => string;
	/** "scales" phase output: each row's own resolved opacity, composed from `channels.opacity` and the opacity ramp — `undefined` when `opacity` itself is unset. */
	resolveOpacity?: (row: TData) => number;

	// "markers" phase output.
	markers?: CellMarkerConfig[];
};

/** The environment every HeatmapPlot phase reads from, alongside the growing state. */
export type HeatmapPlotCtx = {
	cfg: ChartConfig;
	range: HeatmapRangeFilter | null | undefined;
};
