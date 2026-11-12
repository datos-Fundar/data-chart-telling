import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { WithValues } from '$lib/types/layout/styles';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { BoxValuePart } from '$lib/types/plots/distribution/box/props';
import type { BoxRowContext } from '$lib/types/plots/distribution/box/props';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { DensityKernel } from '$lib/types/transforms/density';

/** `styles` of `ViolinPlot`: how each category's density is estimated and drawn. */
export type ViolinPlotStylesConfig = WithValues<
	AxisBasedStylesConfig,
	PointLabelConfig,
	BoxValuePart
> & {
	kernel?: DensityKernel;
	/** Kernel bandwidth in data units; Silverman's rule picks one per violin when unset. */
	bandwidth?: number;
	/** Cuts each violin at its values' own extent. Defaults to `true`; `false` lets the tails fade out past it, which the value axis does not reach. */
	trim?: boolean;
	/** `'width'` gives every violin the same full width; `'shared'` draws all of them on one density scale, so their areas compare. Defaults to `'width'`. */
	scale?: 'width' | 'shared';
	/** The box inside each violin: `false` leaves it out, a number sets its width in pixels. */
	box?: boolean | number;
};

/** `ViolinPlot`'s public props. */
export type ViolinPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	ViolinPlotStylesConfig,
	AreaStyle,
	BoxRowContext
>;

/** What `ViolinPlot`'s core draws from. */
export type ViolinPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	ViolinPlotStylesConfig,
	AreaStyle
>;
