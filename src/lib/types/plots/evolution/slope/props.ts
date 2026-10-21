import type { LinePlotProps, LinePlotCoreProps } from '$lib/types/plots/evolution/line/props';

/** `SlopePlot`'s public props: a line plot's, over a category axis of two positions. */
export type SlopePlotProps<TData extends Record<string, unknown>> = LinePlotProps<TData>;

/** What `SlopePlot`'s core draws from. */
export type SlopePlotCoreProps<TData extends Record<string, unknown>> = LinePlotCoreProps<TData>;
