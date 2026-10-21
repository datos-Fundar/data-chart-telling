import type { StrokeStyle } from '$lib/types/plots/styling';

/** A stroke channel per row: a field key of the row, or a function of it. */
type RowChannel<T> = string | ((d: never) => T) | undefined;

/**
 * The stroke of a line-like marker that takes it row by row (a `rule`, an
 * `arrow`): each of `stroke`, `strokeWidth` and `strokeOpacity` is a field of
 * the row or a function of it, else the marker's own `styles`, else a default.
 * A color and an opacity per row are drawn as they are - svelteplot would map
 * them through its own color and opacity scales.
 */
export class RowStroke {
	/** A per-row channel as the function svelteplot reads. */
	static #accessor<T>(channel: RowChannel<T>) {
		return typeof channel === 'string'
			? (d: Record<string, unknown>) => d[channel] as T
			: (channel as ((d: Record<string, unknown>) => T) | undefined);
	}

	/** The props a mark takes for `channels`, over `styles` and the given `fallback`s. */
	static of(
		channels: {
			stroke?: RowChannel<string | undefined>;
			strokeWidth?: RowChannel<number>;
			strokeOpacity?: RowChannel<number>;
		},
		styles: StrokeStyle | undefined,
		fallback: { stroke: string; strokeWidth?: number; strokeOpacity?: number }
	) {
		const color = RowStroke.#accessor(channels.stroke);
		const width = RowStroke.#accessor(channels.strokeWidth);
		const opacity = RowStroke.#accessor(channels.strokeOpacity);
		return {
			stroke: color ? { value: color, scale: null } : (styles?.stroke ?? fallback.stroke),
			strokeWidth: width ?? styles?.strokeWidth ?? fallback.strokeWidth,
			strokeOpacity: (opacity
				? { value: opacity, scale: null }
				: (styles?.strokeOpacity ?? fallback.strokeOpacity)) as never
		};
	}
}
