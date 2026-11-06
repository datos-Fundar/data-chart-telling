import { isBrowser } from '$lib/stores/device';

type Rgb = [number, number, number];

/** A CSS color string: read into its red, green and blue, and judged against another by WCAG contrast. */
export class CssColor {
	/** Resolves a `var(--x)` reference to its computed value; any other CSS color string passes through unchanged. */
	static resolve(color: string): string {
		if (!isBrowser) return color;
		if (!color.startsWith('var(')) return color;
		const varName = color.slice(4, -1).trim();
		const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
		return value || color;
	}

	/** Parses any CSS color syntax (hex, rgb(), oklch(), named colors, hsl(), ...) into an `[r, g, b]` (0-255) triple, or `null` if it can't be resolved. */
	static parse(color: string): Rgb | null {
		const hex = CssColor.#hex(color);
		if (hex) return [hex[0], hex[1], hex[2]];
		const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(color);
		if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];

		const oklch = CssColor.#parseOklch(color);
		if (oklch) return oklch;

		// Named colors, hsl(), and any other CSS color syntax: resolved to
		// `rgb(...)` via the browser's computed style, then reparsed.
		if (!isBrowser) return null;
		const el = document.createElement('div');
		el.style.color = color;
		document.body.appendChild(el);
		const computed = getComputedStyle(el).color;
		document.body.removeChild(el);
		if (!computed || computed === color) return null;
		return CssColor.parse(computed);
	}

	/** WCAG contrast ratio between two colors, from 1 (no contrast) to 21 (black on white). */
	static contrastRatio(colorA: string, colorB: string): number {
		const a = CssColor.parse(CssColor.resolve(colorA));
		const b = CssColor.parse(CssColor.resolve(colorB));
		if (!a || !b) return 1;
		const lA = CssColor.#luminance(a);
		const lB = CssColor.#luminance(b);
		return (Math.max(lA, lB) + 0.05) / (Math.min(lA, lB) + 0.05);
	}

	/** The WCAG 2 AA contrast ratio for normal text. */
	static readonly AA = 4.5;

	/**
	 * The `candidates` entry with the highest WCAG contrast ratio against an opaque `background`. Defaults to plain
	 * white/black; pass a grayscale or other palette to widen the choice. When none reaches `minRatio` (WCAG AA for
	 * normal text by default), white or black is taken instead, whichever reads better - one of them always reaches
	 * 4.5 on an opaque color. Falls back to the first candidate when `background` can't be parsed.
	 */
	static contrastText(
		background: string,
		candidates: string[] = ['#ffffff', '#000000'],
		minRatio: number = CssColor.AA
	): string {
		const best = (colors: string[]) =>
			colors.reduce(
				(top, color) => {
					const ratio = CssColor.contrastRatio(background, color);
					return ratio > top.ratio ? { color, ratio } : top;
				},
				{ color: colors[0], ratio: -Infinity }
			);
		if (candidates.length === 0) return '#000000';
		const own = best(candidates);
		if (own.ratio >= minRatio) return own.color;
		const plain = best(['#ffffff', '#000000']);
		return plain.ratio > own.ratio ? plain.color : own.color;
	}

	/** The opacity of a CSS color, from 0 to 1: its alpha (`rgba()`, `#rrggbbaa`...), 0 for `transparent`, else 1. */
	static alpha(color: string): number {
		const trimmed = CssColor.resolve(color).trim();
		if (trimmed === 'transparent') return 0;
		const hex = CssColor.#hex(trimmed);
		if (hex) return hex[3];
		const own = /^(?:rgba?|hsla?|oklch|oklab|lab|lch)\(([^)]*)\)$/i.exec(trimmed);
		if (!own) return 1;
		const parts = own[1].split(/[\s,/]+/).filter(Boolean);
		const slashed = own[1].includes('/');
		const value = slashed || parts.length === 4 ? parts.at(-1) : undefined;
		if (value === undefined) return 1;
		const alpha = value.endsWith('%') ? Number(value.slice(0, -1)) / 100 : Number(value);
		return Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 1;
	}

	/**
	 * The opaque color `color` is seen as, drawn at `opacity` (times its own alpha) over `backdrop`, as a browser
	 * blends it. A backdrop that is not opaque counts as white, the page under it. `color` as it is when unreadable.
	 */
	static composite(color: string, opacity = 1, backdrop = '#ffffff'): string {
		const own = CssColor.parse(CssColor.resolve(color));
		if (!own) return color;
		const alpha = Math.max(0, Math.min(1, CssColor.alpha(color) * opacity));
		if (alpha >= 1) return `rgb(${own.join(', ')})`;
		const under =
			CssColor.alpha(backdrop) >= 1 ? CssColor.parse(CssColor.resolve(backdrop)) : undefined;
		const base = under ?? [255, 255, 255];
		const mixed = own.map((c, i) => Math.round(c * alpha + base[i] * (1 - alpha)));
		return `rgb(${mixed.join(', ')})`;
	}

	/** A hex color's `[r, g, b]` (0-255) and alpha (0-1), in its 3, 4, 6 or 8 digit form. */
	static #hex(color: string): [number, number, number, number] | null {
		const match = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(color.trim());
		if (!match) return null;
		const digits =
			match[1].length <= 4
				? match[1]
						.split('')
						.map((c) => c + c)
						.join('')
				: match[1];
		const byte = (i: number) => parseInt(digits.slice(i, i + 2), 16);
		return [byte(0), byte(2), byte(4), digits.length === 8 ? byte(6) / 255 : 1];
	}

	static #luminance([r, g, b]: Rgb): number {
		const [rs, gs, bs] = [r, g, b].map((c) => {
			const s = c / 255;
			return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
	}

	static #linearToSrgb8(c: number): number {
		const s = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
		return Math.max(0, Math.min(1, s)) * 255;
	}

	/**
	 * Parses `oklch(L C H)` directly instead of round-tripping through the
	 * browser's computed style: Chromium/Firefox serialize computed oklch()
	 * values back as oklch() (not rgb()), so the generic browser-fallback in
	 * {@link CssColor.parse} sees an unchanged string on the second pass and its
	 * infinite-loop guard mistakes that for a parse failure.
	 */
	static #parseOklch(color: string): Rgb | null {
		const match = /^oklch\(\s*([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)/i.exec(color.trim());
		if (!match) return null;
		const L = match[2] ? Number(match[1]) / 100 : Number(match[1]);
		const C = Number(match[3]);
		const H = (Number(match[4]) * Math.PI) / 180;
		const a = C * Math.cos(H);
		const b = C * Math.sin(H);

		const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
		const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
		const s_ = L - 0.0894841775 * a - 1.291485548 * b;
		const l = l_ ** 3;
		const m = m_ ** 3;
		const s = s_ ** 3;

		const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
		const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
		const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

		return [CssColor.#linearToSrgb8(r), CssColor.#linearToSrgb8(g), CssColor.#linearToSrgb8(bl)];
	}
}
