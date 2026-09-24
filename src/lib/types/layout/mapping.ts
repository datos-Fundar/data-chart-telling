import type { AxisValue } from '$lib/types/layout/scales';

/** One channel's own resolved data accessor — mirrors svelteplot's own `ChannelAccessor`. */
export type ResolvedChannel<TData, TValue = AxisValue> = {
	accessor: (row: TData) => TValue;
};
