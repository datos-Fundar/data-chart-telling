import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
import { RowStyle } from '$lib/markers/utils/RowStyle';
import { CssColor } from '$lib/utils/color/CssColor';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { LineStyle } from '$lib/types/plots/constants';

/**
 * A plot's markers with their styles as svelteplot reads them, before any is drawn: a named line style
 * (`strokeDasharray: 'dashed'`) is the SVG dash pattern it stands for, wherever in a marker's config it is
 * set - its `styles`, a label's, a part's (a box's whiskers) - and a label inside its shape with no `fill` of its
 * own is written in the color that reads best on the shape's. A marker component draws what it is given.
 */
export class MarkerStyles {
	/** The SVG dash pattern each named line style stands for; a solid line has none. */
	static readonly #DASHES: Record<LineStyle, string | undefined> = {
		solid: undefined,
		dashed: '6 4',
		dotted: '2 3',
		dashdot: '6 3 2 3'
	};

	/** The style fields that take a dash pattern. */
	static readonly #DASH_KEYS = new Set(['strokeDasharray', 'dotStrokeDasharray']);

	/** The label colors this class chose for a shape's color, which a restyled shape chooses again. */
	static readonly #contrasts = new WeakSet<object>();

	/** Fields that hold rows rather than config, which are never walked. */
	static readonly #ROW_KEYS = new Set(['data', 'features']);

	/**
	 * Every marker of `markers`, resolved. A marker with nothing to resolve is kept as it is. `rows` are what a
	 * marker with no `data` of its own draws.
	 */
	static resolveAll<T>(markers: T[], plot: { cfg?: PlotStylesConfig; rows?: unknown[] } = {}): T[] {
		return markers.map((marker) => MarkerStyles.#contrasted(MarkerStyles.#walk(marker), plot) as T);
	}

	/**
	 * `marker` resolved again after its styles changed (as the hover restyles a shape): a label written in the color
	 * that read best on the shape's old one reads best on its new one.
	 */
	static restyle<T>(marker: T, plot: { cfg?: PlotStylesConfig; rows?: unknown[] } = {}): T {
		const label = (marker as { label?: { styles?: { fill?: unknown } } }).label;
		const fill = label?.styles?.fill;
		const fresh =
			typeof fill === 'function' && MarkerStyles.#contrasts.has(fill)
				? { ...marker, label: { ...label, styles: { ...label!.styles, fill: undefined } } }
				: marker;
		return MarkerStyles.resolveAll([fresh], plot)[0];
	}

	/** The marker with its label inside its shape written in the candidate that reads best on each row's color. */
	static #contrasted(marker: unknown, plot: { cfg?: PlotStylesConfig; rows?: unknown[] }): unknown {
		const { cfg } = plot;
		if (!cfg || !MarkerStyles.#isPlain(marker)) return marker;
		const label = marker.label as { outside?: boolean; styles?: { fill?: unknown } } | undefined;
		if (!MarkerStyles.#isPlain(label) || label.outside || label.styles?.fill !== undefined) {
			return marker;
		}
		const colorOf = MarkerStyles.#shapeColor(
			marker,
			(marker.data as unknown[]) ?? plot.rows ?? [],
			cfg
		);
		if (!colorOf) return marker;
		const candidates = cfg.text.label.contrast;
		const opacityOf = MarkerStyles.#opacity(
			(marker.styles as { fillOpacity?: unknown } | undefined)?.fillOpacity
		);
		// What the label is read on: the shape's color, blended with the plot's background as far as it is see-through.
		const fill = (row: unknown) => {
			const color = colorOf(row);
			if (!color) return undefined;
			const seen = CssColor.composite(color, opacityOf(row), cfg.background);
			return CssColor.contrastText(seen, candidates);
		};
		MarkerStyles.#contrasts.add(fill);
		return { ...marker, label: { ...label, styles: { ...label.styles, fill } } };
	}

	/** The opacity each row's shape is drawn with: a number, the field of the rows a string names, a function of the row. */
	static #opacity(style: unknown): (row: unknown) => number {
		const read =
			typeof style === 'function'
				? (row: unknown) => (style as (row: unknown) => unknown)(row)
				: typeof style === 'string'
					? (row: unknown) => (row as Record<string, unknown> | undefined)?.[style]
					: () => style;
		return (row) => {
			const value = Number(read(row) ?? 1);
			return Number.isFinite(value) ? value : 1;
		};
	}

	/** The color each row's shape is drawn with: the marker's `color` channel, else its `styles.fill`. */
	static #shapeColor(
		marker: Record<string, unknown>,
		rows: unknown[],
		cfg: PlotStylesConfig
	): ((row: unknown) => string | undefined) | undefined {
		const fill = (marker.styles as { fill?: unknown } | undefined)?.fill;
		return (
			MarkerChannels.buildFill(rows, marker.color as never, marker.scales as never, cfg) ??
			RowStyle.colorOf(fill, rows) ??
			(marker.type === 'waffle' ? () => cfg.palette[0] : undefined)
		);
	}

	/** A dash pattern for `style`: a named line style's, any other as it is; a function of the row gives each row's. */
	static #dash(style: unknown): unknown {
		if (typeof style === 'function')
			return (...args: unknown[]) => MarkerStyles.#pattern(style(...args)) ?? 'none';
		return MarkerStyles.#pattern(style);
	}

	static #pattern(style: unknown): unknown {
		return typeof style === 'string' && style in MarkerStyles.#DASHES
			? MarkerStyles.#DASHES[style as LineStyle]
			: style;
	}

	/** `value` with its dash styles resolved: plain objects and arrays walked, copied only where something changes. */
	static #walk(value: unknown): unknown {
		if (Array.isArray(value)) {
			const next = value.map((item) => MarkerStyles.#walk(item));
			return next.some((item, i) => item !== value[i]) ? next : value;
		}
		if (!MarkerStyles.#isPlain(value)) return value;
		let copy: Record<string, unknown> | undefined;
		for (const [key, own] of Object.entries(value)) {
			if (MarkerStyles.#ROW_KEYS.has(key)) continue;
			const next = MarkerStyles.#DASH_KEYS.has(key)
				? MarkerStyles.#dash(own)
				: MarkerStyles.#walk(own);
			if (next === own) continue;
			copy ??= { ...value };
			copy[key] = next;
		}
		return copy ?? value;
	}

	static #isPlain(value: unknown): value is Record<string, unknown> {
		if (typeof value !== 'object' || value === null) return false;
		const proto = Object.getPrototypeOf(value);
		return proto === Object.prototype || proto === null;
	}
}
