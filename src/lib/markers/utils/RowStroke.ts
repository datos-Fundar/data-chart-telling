import type { PerRow, StrokeStyle } from '$lib/types/plots/styling';
import { RowStyle } from '$lib/markers/utils/RowStyle';
import { Paint } from '$lib/markers/utils/Paint';

/**
 * The stroke of a line-like marker that takes it row by row (a `rule`, an `arrow`): each of
 * `stroke`, `strokeWidth` and `strokeOpacity` in the marker's `styles` is a value or a function of
 * the row, else a default. A color and an opacity per row are drawn as they are - svelteplot would
 * map them through its own color and opacity scales. A stroke can be a gradient (`Paint`): `paint` names the ones
 * to draw.
 */
export class RowStroke {
	/**
	 * The props a mark takes for `styles`, over the given `fallback`s; `rows` are what a string in `styles` can name a
	 * field of, and `prefix` names the gradients.
	 */
	static of(
		styles: PerRow<StrokeStyle> | undefined,
		rows: readonly unknown[],
		fallback: { stroke: string; strokeWidth?: number; strokeOpacity?: number },
		prefix: string
	) {
		const paint = Paint.of(rows, styles?.stroke, undefined, prefix);
		return {
			paint,
			stroke: paint.prop ?? fallback.stroke,
			strokeWidth: RowStyle.field(styles?.strokeWidth) ?? fallback.strokeWidth,
			strokeOpacity: (RowStyle.opacity(styles?.strokeOpacity) ?? fallback.strokeOpacity) as never
		};
	}
}
