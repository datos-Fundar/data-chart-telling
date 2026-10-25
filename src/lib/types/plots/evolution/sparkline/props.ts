import type { LinePlotProps, LinePlotCoreProps } from '$lib/types/plots/evolution/line/props';

/** `SparklinePlot`'s public props: a line plot's. */
export type SparklinePlotProps<TData extends Record<string, unknown>> = LinePlotProps<TData>;

/** What `SparklinePlot`'s core draws from. */
export type SparklinePlotCoreProps<TData extends Record<string, unknown>> =
	LinePlotCoreProps<TData>;
