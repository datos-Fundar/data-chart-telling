import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { AreaEdgeLabelConfig } from '$lib/types/markers/labels/path';
import type { CommonMarkerConfigWithOrientation } from '$lib/types/markers/channels/commonMarkerConfigWithOrientation';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { CommonMarkerConfigWithLabel } from '$lib/types/markers/channels/commonMarkerConfigWithLabel';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithArea } from '$lib/types/markers/channels/commonMarkerConfigWithArea';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';
import type { CurveName } from '$lib/types/layout/styles/curve';

/** A filled area under a curve, or a band between two curves (svelteplot's `AreaX`/`AreaY`). */
export type AreaMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'area';
	curve?: CurveName;
	tension?: number;
	styles?: AreaStyle;
} & CommonMarkerConfigWithOrientation &
	CommonMarkerConfigWithArea<TContext> &
	CommonMarkerConfigWithColor<TContext> &
	CommonMarkerConfigWithInterval<TContext> &
	CommonMarkerConfigWithLabel<AreaEdgeLabelConfig<TContext> | PointLabelConfig<TContext>>;
