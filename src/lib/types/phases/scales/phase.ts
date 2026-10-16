import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { AxisRef } from '$lib/types/phases/data/axes';
import type { AxisScale } from '$lib/types/layout/scales';

/** One axis' scale options, whatever the row type. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisScale = AxisScale<any>;

/**
 * What differs between plots in the shared "scales" stage. The stage lays out
 * every category axis the kind asks for as a band and grows an unpinned
 * numeric axis to cover derived markers and transformed ranges; these say
 * where a kind goes beyond that.
 */
export type ScalesStageOptions<TState, TCtx> = {
	/** Axes whose marks grow from zero, so a domain this stage sets still reaches it - by name or by role (`'value'`). */
	zero?: AxisRef[];
	/** Axes that reach as far below zero as above it, to the largest magnitude - by name or by role. */
	symmetric?: AxisRef[];
	/** Keeps a category axis in the order the data gives it. Without it, categories sort ascending, as svelteplot does. */
	bandOrder?: 'data';
	/** The kind's own options for an axis, by name or by role, under the author's `scales`: padding, label anchor, tick format. */
	defaults?: (state: TState, ctx: TCtx) => Partial<Record<AxisRef, AnyAxisScale>>;
	/** The options the kind fits to its own marks on an axis the author left unpinned - a niced value axis, a domain padded for its dots. */
	fit?: (state: TState, ctx: TCtx) => Partial<Record<AxisChannelName, Partial<AnyAxisScale>>>;
	/** The kind's own extra "scales" output, once every scale is in place. */
	extend?: (state: TState, ctx: TCtx) => TState;
};
