import type { Gradient as GradientPaint } from '$lib/types/plots/styling';

/** A stop as it is drawn: its color and opacity, and where - a share of the span, a value on the axis, or unset. */
export type GradientDefStop = {
	color: string;
	opacity: number;
	at?: { share: number } | { value: unknown };
};

/** A gradient as it is drawn: one `<linearGradient>`, named by `id`. */
export type GradientDef = {
	id: string;
	axis: 'x' | 'y';
	span: 'shape' | 'plot';
	stops: GradientDefStop[];
};

const PERCENT = /^-?\d+(\.\d+)?%$/;

/** A gradient a marker paints with (`Paint`), as `GradientDefs` draws it: one `<linearGradient>`. */
export class Gradient {
	/** Whether a paint is a gradient, not a color. */
	static is(paint: unknown): paint is GradientPaint {
		return (
			typeof paint === 'object' &&
			paint !== null &&
			Array.isArray((paint as GradientPaint).gradient)
		);
	}

	/**
	 * The offsets (0-1) of a gradient's stops along its span, in order, with the stops: a share is its own, a value
	 * is where `project` puts it, and a stop without either is spread evenly between its neighbours (the first at
	 * 0, the last at 1). Stops listed from the end of the span back are read the other way round.
	 */
	static offsets(
		stops: readonly GradientDefStop[],
		project: (value: unknown) => number | undefined
	): { stop: GradientDefStop; offset: number }[] {
		if (!stops.length) return [];
		const known = stops.map((stop) => {
			const at = stop.at;
			const share = !at ? undefined : 'share' in at ? at.share : project(at.value);
			return share === undefined || !Number.isFinite(share)
				? undefined
				: Math.min(Math.max(share, 0), 1);
		});
		const last = known.length - 1;
		if (known[0] === undefined) known[0] = 0;
		if (known[last] === undefined) known[last] = last === 0 ? 0 : 1;
		for (let i = 1; i < last; i++) {
			if (known[i] !== undefined) continue;
			const before = i - 1;
			let after = i + 1;
			while (known[after] === undefined) after++;
			const from = known[before]!;
			known[i] = from + ((known[after]! - from) * (i - before)) / (after - before);
		}
		const placed = stops.map((stop, i) => ({ stop, offset: known[i]! }));
		if (placed[0].offset > placed[last].offset) placed.reverse();
		return placed.sort((a, b) => a.offset - b.offset);
	}

	/**
	 * The one color a paint stands for where only a color will do - a legend's swatch, a text in a shape's color:
	 * a color itself, or a gradient's middle stop's; `undefined` when that stop has none of its own.
	 */
	static swatch(paint: unknown): string | undefined {
		if (typeof paint === 'string') return paint;
		if (!Gradient.is(paint) || !paint.gradient.length) return undefined;
		const middle = paint.gradient[Math.floor((paint.gradient.length - 1) / 2)];
		return typeof middle === 'string' ? middle : middle.color;
	}

	/**
	 * A paint the author gave over the color it falls back to (a series'): the color while the paint is unset, a
	 * gradient in that color where a stop has none, else the paint as it is.
	 */
	static over<TPaint>(paint: TPaint | undefined, color: string): TPaint | string {
		if (paint === undefined || paint === null) return color;
		return Gradient.is(paint) ? (Gradient.tint(paint, color) as TPaint) : paint;
	}

	/** The opacity a fill takes by default: none for a gradient, which carries its own. */
	static defaultOpacity(fill: unknown, opacity: number | undefined): number | undefined {
		return Gradient.is(fill) ? undefined : opacity;
	}

	/** Whether a gradient has a stop with no color of its own, which takes the shape's. */
	static isTinted(paint: GradientPaint): boolean {
		return paint.gradient.some((stop) => typeof stop !== 'string' && !stop.color);
	}

	/** A gradient with `color` in each stop that has none of its own. */
	static tint(paint: GradientPaint, color: string | undefined): GradientPaint {
		if (!color || !Gradient.isTinted(paint)) return paint;
		return {
			...paint,
			gradient: paint.gradient.map((stop) =>
				typeof stop === 'string' || stop.color ? stop : { ...stop, color }
			)
		};
	}

	/** A gradient as it is drawn, named `id`: each stop's color, `own` where it has none. */
	static def(paint: GradientPaint, own: string | undefined, id: string): GradientDef {
		const stops = paint.gradient.map((stop): GradientDefStop => {
			const { color, opacity, at } = typeof stop === 'string' ? { color: stop } : stop;
			return {
				color: color ?? own ?? 'currentColor',
				opacity: opacity ?? 1,
				...(at === undefined
					? {}
					: {
							at:
								typeof at === 'string' && PERCENT.test(at)
									? { share: Number.parseFloat(at) / 100 }
									: { value: at }
						})
			};
		});
		const byValue = stops.some((stop) => stop.at && 'value' in stop.at);
		return {
			id,
			axis: paint.axis ?? 'x',
			span: byValue ? 'plot' : (paint.span ?? 'shape'),
			stops
		};
	}
}
