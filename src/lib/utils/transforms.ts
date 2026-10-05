import { stackX, stackY } from 'svelteplot';
import type { MarkerTransform } from '$lib/types/transforms';

type Row = Record<string, unknown>;

/**
 * Runs one transform through svelteplot and returns what it produces — the
 * transform's own output, ready to spread into the marker's props. The only
 * split is the one svelteplot's own signature needs: options go as a second
 * argument, the rest is the first argument as it's written.
 */
export function runTransform(transform: MarkerTransform): Record<string, unknown> {
	const { type, offset, order, reverse, ...input } = transform;
	const run = type === 'stackY' ? stackY : stackX;
	return run(input as never, { offset, order, reverse }) as unknown as Record<string, unknown>;
}

/**
 * Applies a marker's `transforms` in order, each one's output feeding the next.
 * A transform reads the marker's own rows, `x`/`y` and `grouping` (its `z`) by
 * default, falling back to the plot's rows when the marker has none. Any of
 * those the transform sets itself wins. The output is merged onto the marker.
 */
export function resolveTransforms<T extends object>(marker: T, fallbackData: Row[]): T {
	const own = marker as T & {
		data?: Row[];
		x?: unknown;
		y?: unknown;
		grouping?: unknown;
		transforms?: MarkerTransform[];
	};
	if (!own.transforms?.length) return marker;
	let resolved: Record<string, unknown> = { ...own };
	for (const transform of own.transforms) {
		// The marker's own rows and channels are the defaults; the transform's
		// own props win over them.
		const withDefaults = {
			data: (resolved.data as Row[] | undefined) ?? fallbackData,
			x: resolved.x,
			y: resolved.y,
			z: resolved.grouping,
			...transform
		} as MarkerTransform;
		resolved = { ...resolved, ...runTransform(withDefaults) };
	}
	return resolved as T;
}
