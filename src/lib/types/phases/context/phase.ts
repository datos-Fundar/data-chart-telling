/**
 * What a plot kind works out for each of its processed rows beyond the shared context (its series, `x`, `y` and
 * value): a tile's share, a bin's edges, a box's quartiles. Given the state once, it returns a function of a row,
 * so whatever the rows share (a total, a box's summary) is worked out once. What it returns is laid over the
 * shared context, so it can also replace the `value` a row shows.
 */
export type ContextStageOptions<TState, TEnv = unknown> = (
	state: TState,
	env: TEnv
) => (row: never) => object | undefined;
