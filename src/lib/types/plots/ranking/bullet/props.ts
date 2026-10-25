import type { BulletStylesConfig } from '$lib/types/layout/styles';
import type { BarPlotProps, BarPlotCoreProps } from '$lib/types/plots/ranking/bar/props';
import type { Accessor } from '$lib/types/plots/data/common';

/**
 * What a bullet plot measures each category against: a `target`, and the
 * `ranges` that grade the value. Each is a field of the row, a function of
 * it, or a number the same for every category.
 */
export type BulletReferenceProps<TData extends Record<string, unknown>> = {
	/** Where the value should get to: a tick across the category's band at this value. */
	target?: Accessor<TData, number> | number;
	/** The upper bounds of the bands that grade the value, in any order: each runs from the baseline to its bound, the smallest band darkest. */
	ranges?: (Accessor<TData, number> | number)[];
};

/** `BulletPlot`'s public props: a bar plot with a target and ranges. */
export type BulletPlotProps<TData extends Record<string, unknown>> = Omit<
	BarPlotProps<TData>,
	'styles'
> &
	BulletReferenceProps<TData> & { styles?: BulletStylesConfig };

/** What `BulletPlot`'s core draws from. */
export type BulletPlotCoreProps<TData extends Record<string, unknown>> = Omit<
	BarPlotCoreProps<TData>,
	'styles'
> &
	BulletReferenceProps<TData> & { styles?: BulletStylesConfig };
