import { Gradient, type GradientDef } from '$lib/markers/utils/Gradient';
import { RowStyle } from '$lib/markers/utils/RowStyle';
import type { Gradient as GradientPaint } from '$lib/types/plots/styling';

/** How a marker paints its rows: the color or `url(#id)` of each one, and the gradients those name. */
export type Paints<TRow> = {
	/** What a row is painted with, `undefined` when nothing paints it. */
	at: (row: TRow, index?: number) => string | undefined;
	/** The gradients to draw (`GradientDefs`), none while no row is painted with one. */
	defs: GradientDef[];
	/**
	 * The paint as a svelteplot mark takes it: the one every row shares as it is, else a function of the row with no
	 * scale, so what it returns is drawn as it is.
	 */
	prop: never;
};

/**
 * A marker's fill or stroke, resolved for each of its rows in one place. A style is a color, the field of the rows a
 * string names, a gradient, or a function of the row that returns a color or a gradient. A gradient wins over the
 * marker's `color` channel, and takes the channel's color where a stop has none of its own; else the channel's color
 * wins over the style's. Rows painted with the same gradient in the same color share one.
 */
export class Paint {
	/**
	 * The channel, for a marker whose own color wins over it: only while `style` sets none, or is a gradient that
	 * takes the channel's color where a stop has none.
	 */
	static under<T>(style: unknown, channel: T | undefined): T | undefined {
		return style === undefined || Gradient.is(style) ? channel : undefined;
	}

	static of<TRow>(
		rows: readonly TRow[],
		style: unknown,
		channel: ((row: TRow) => string | undefined) | undefined,
		prefix: string
	): Paints<TRow> {
		const read: (row: TRow, index?: number) => unknown =
			typeof style === 'function'
				? (row, index) => (style as (row: TRow, index: number) => unknown)(row, index ?? 0)
				: Gradient.is(style)
					? () => style
					: (RowStyle.colorOf(style, rows) ?? (() => undefined));
		/** A row's own color, where its gradient has a stop without one: its channel's. */
		const ownOf = (paint: GradientPaint, row: TRow) =>
			Gradient.isTinted(paint) ? channel?.(row) : undefined;
		const keyOf = (paint: GradientPaint, own: string | undefined) =>
			JSON.stringify([paint, own ?? null]);

		const defs = new Map<string, GradientDef>();
		const at = (row: TRow, index?: number): string | undefined => {
			const paint = read(row, index);
			if (!Gradient.is(paint)) return channel?.(row) ?? (paint as string | undefined);
			const def = defs.get(keyOf(paint, ownOf(paint, row)));
			return def ? `url(#${def.id})` : undefined;
		};
		rows.forEach((row, index) => {
			const paint = read(row, index);
			if (!Gradient.is(paint)) return;
			const own = ownOf(paint, row);
			const key = keyOf(paint, own);
			if (!defs.has(key)) defs.set(key, Gradient.def(paint, own, `${prefix}-${defs.size}`));
		});

		const values = new Set(rows.map((row, index) => at(row, index)));
		const [shared] = values;
		return {
			at,
			defs: [...defs.values()],
			prop: (values.size <= 1 ? shared : { value: at, scale: null }) as never
		};
	}

	/**
	 * The paint of a shape that stands for no row (a frame, a violin's outline): its color, or `url(#id)` of its
	 * gradient, `own` in a stop with none.
	 */
	static single(
		style: unknown,
		own: string | undefined,
		prefix: string
	): { value: string | undefined; defs: GradientDef[] } {
		if (!Gradient.is(style))
			return { value: typeof style === 'string' ? style : undefined, defs: [] };
		const paints = Paint.of([{}], Gradient.tint(style, own), undefined, prefix);
		return { value: paints.at({}), defs: paints.defs };
	}
}
