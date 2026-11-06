import type { LineStyle } from '$lib/types/plots/constants';

/**
 * A plot's markers with their styles as svelteplot reads them, before any is drawn: a named line style
 * (`strokeDasharray: 'dashed'`) is the SVG dash pattern it stands for, wherever in a marker's config it is
 * set - its `styles`, a label's, a part's (a box's whiskers). A marker component draws what it is given.
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

	/** Fields that hold rows rather than config, which are never walked. */
	static readonly #ROW_KEYS = new Set(['data', 'features']);

	/** Every marker of `markers`, resolved. A marker with nothing to resolve is kept as it is. */
	static resolveAll<T>(markers: T[]): T[] {
		return markers.map((marker) => MarkerStyles.#walk(marker) as T);
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
