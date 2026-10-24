import type { SymbolScaleConfig } from '$lib/types/layout/scales';
import type { SymbolType } from '$lib/types/plots/constants';

/** A value of the symbol channel mapped to a shape. */
export class SymbolScale {
	/**
	 * Resolves a {@link SymbolScaleConfig} into a `value => shape` function -
	 * always a discrete category lookup, unlike every other channel here (there's
	 * no continuous case for a shape). Resolves to a plain shape-name string,
	 * which svelteplot recognizes as a literal and renders as-is - safe to hand
	 * straight to a per-row accessor, unlike `OpacityScale.resolve`'s output.
	 * `defaultRange` mirrors `OpacityScale.resolve`'s own required (not defaulted)
	 * parameter - callers pass the theme's own `cfg.symbols` rather than this
	 * module hardcoding a second copy of the default cycle.
	 */
	static resolve(
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
}

/** The package's public function name, over {@link SymbolScale.resolve}. */
export const resolveSymbolScale = SymbolScale.resolve;
