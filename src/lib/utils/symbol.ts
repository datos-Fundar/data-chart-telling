import type { SymbolScaleConfig } from '$lib/types/layout/scales';
import { maybeSymbol } from 'svelteplot/helpers/symbols.js';
import type { SymbolType } from '$lib/types/plots/constants';

/**
 * Resolves a {@link SymbolScaleConfig} into a `value => shape` function -
 * always a discrete category lookup, unlike every other channel here (there's
 * no continuous case for a shape). Resolves to a plain shape-name string,
 * which svelteplot recognizes as a literal and renders as-is - safe to hand
 * straight to a per-row accessor, unlike `resolveOpacityScale`'s output.
 * `defaultRange` mirrors `resolveOpacityScale`'s own required (not defaulted)
 * parameter - callers pass the theme's own `cfg.symbols` rather than this
 * module hardcoding a second copy of the default cycle.
 */
export function resolveSymbolScale(
	config: SymbolScaleConfig | undefined,
	computedDomain: string[] | undefined,
	defaultRange: SymbolType[]
): (value: unknown) => SymbolType {
	const domain = config?.domain ?? computedDomain ?? [];
	const range = config?.range ?? defaultRange;
	const unknown = config?.unknown ?? 'circle';

	if (typeof range === 'object' && !Array.isArray(range)) {
		return (v) => (v == null ? unknown : (range[String(v)] ?? unknown));
	}

	return (v) => {
		if (v == null || !domain.length) return unknown;
		const idx = domain.indexOf(String(v));
		return idx < 0 ? unknown : range[idx % range.length];
	};
}

/**
 * A symbol's SVG path, as svelteplot's `dot` mark draws it: the same
 * d3-shape symbol, sized to the area of a circle of the given radius.
 */
export class SymbolPath {
	#d = '';
	#bounds = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };

	readonly #k: number;
	readonly #dx: number;
	readonly #dy: number;

	private constructor(k = 1, dx = 0, dy = 0) {
		this.#k = k;
		this.#dx = dx;
		this.#dy = dy;
	}

	/** The path of `symbol` at `radius`, centred on the origin. */
	static of(symbol: SymbolType, radius: number): string {
		return SymbolPath.#draw(symbol, radius, new SymbolPath()).#d;
	}

	/** The path of `symbol`, scaled to fit and centred in a `size`-wide square from the origin. */
	static fitted(symbol: SymbolType, size: number): string {
		const { x0, y0, x1, y1 } = SymbolPath.#draw(symbol, 1, new SymbolPath()).#bounds;
		const k = size / Math.max(x1 - x0, y1 - y0);
		const fit = new SymbolPath(k, size / 2 - (k * (x0 + x1)) / 2, size / 2 - (k * (y0 + y1)) / 2);
		return SymbolPath.#draw(symbol, 1, fit).#d;
	}

	static #draw(symbol: SymbolType, radius: number, path: SymbolPath): SymbolPath {
		maybeSymbol(symbol === 'line' ? 'circle' : symbol).draw(path as never, radius ** 2 * Math.PI);
		return path;
	}

	moveTo(x: number, y: number): void {
		this.#d += `M${this.#point(x, y)}`;
	}

	lineTo(x: number, y: number): void {
		this.#d += `L${this.#point(x, y)}`;
	}

	closePath(): void {
		this.#d += 'Z';
	}

	rect(x: number, y: number, w: number, h: number): void {
		this.moveTo(x, y);
		this.lineTo(x + w, y);
		this.lineTo(x + w, y + h);
		this.lineTo(x, y + h);
		this.closePath();
	}

	/** Only the full circle d3-shape's `circle` draws, from its rightmost point. */
	arc(x: number, y: number, r: number): void {
		this.#point(x, y - r);
		this.#point(x, y + r);
		const kr = this.#k * r;
		const left = this.#point(x - r, y);
		const right = this.#point(x + r, y);
		this.#d += `A${kr},${kr},0,1,1,${left}A${kr},${kr},0,1,1,${right}`;
	}

	/** `x`,`y` in the output's coordinates, widening the drawn bounds. */
	#point(x: number, y: number): string {
		const b = this.#bounds;
		[b.x0, b.y0, b.x1, b.y1] = [
			Math.min(b.x0, x),
			Math.min(b.y0, y),
			Math.max(b.x1, x),
			Math.max(b.y1, y)
		];
		return `${this.#k * x + this.#dx},${this.#k * y + this.#dy}`;
	}
}
