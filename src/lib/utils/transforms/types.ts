import type { MarkerTransform } from '$lib/types/transforms';

export type Row = Record<string, unknown>;

/**
 * Everything one transform type needs to run through svelteplot, and the fixes
 * that type alone needs: `prepare` before it runs, `finish` on the marker once
 * every transform has run. A type without a fix leaves the hook out.
 */
export type TransformAdapter = {
	/** The keys svelteplot reads as channels; every other prop of the transform is an option. */
	channelKeys: Record<string, true>;
	/** svelteplot's own function for this type, taking channels first and options second. */
	run: (channels: Row, options: Row) => Row;
	/** Fixes the transform, given its rows, before svelteplot sees it. */
	prepare?: (transform: MarkerTransform) => MarkerTransform;
	/** Fixes the marker after all of its transforms have been merged onto it. */
	finish?: (marker: Row) => Row;
};
