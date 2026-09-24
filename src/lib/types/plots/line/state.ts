import type { Series, Accessor } from '$lib/types/plots/data/common';
import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
import type { ResolvedChannel } from '$lib/types/layout/mapping';
import type { LegendInteractionStore } from '$lib/types/layout/legend';
import type { ChartConfig } from '$lib/types/configuration/styling';
import type { StrokeStyle, DotStyle } from '$lib/types/plots/styling';
import type { LineMarkerConfig, DotMarkerConfig } from '$lib/types/markers/common';

/** LinePlot's shared pipeline state — raw props plus every phase's own output. */
export type LinePlotState<TData extends Record<string, unknown>> = {
	series?: Series<TData>[];
	data?: TData[];
	x?: Accessor<TData, AxisValue>;
	y?: Accessor<TData, AxisValue>;
	z?: Accessor<TData, unknown>;
	segments: SegmentsConfig<LineSegmentStyle>;
	gaps: GapsConfig<LineSegmentStyle>;
	scales: AxisBasedScalesConfig<TData>;
	width: number;
	height: number;
	margins?: MarginConfig;

	// "data" phase output.
	resolvedSeries?: Series<TData>[];
	groupedSeries?: VisualGroup<Series<TData>, LineSegmentStyle>[];
	flat?: TData[];
	scopedGroups?: ScopedMarkerGroup<TData>[];
	colorForSeries?: (name: string) => string;

	// "mapping" phase output.
	channels?: {
		x: ResolvedChannel<TData>;
		y: ResolvedChannel<TData>;
	};

	// "markers" phase output — real segments plus gap bridges. No "scales"
	// phase — LinePlot forwards `scales` unresolved to `BasePlotLayout`.
	markers?: (LineMarkerConfig | DotMarkerConfig)[];
};

/** The environment every LinePlot phase reads from, alongside the growing state. */
export type LinePlotCtx = {
	cfg: ChartConfig;
	legendInteraction: LegendInteractionStore | null | undefined;
	disabledStrokeFor?: (name: string) => StrokeStyle | undefined;
	disabledDotsFor?: (name: string) => DotStyle | undefined;
};
