import { ColorRamp } from '$lib/utils/color';
import type { OpacityScaleConfig } from '$lib/types/layout/scales';

/** A value of the opacity channel mapped to an opacity. */
export class OpacityScale {
	/**
	 * Resolves an {@link OpacityScaleConfig} into a `value => opacity` function -
	 * mirrors {@link ColorRamp.resolve}'s shape, but the output is always a number in
	 * roughly `[0,1]` instead of a CSS color string. Callers must apply the
	 * result as a literal constant per mark instance (never a per-row function
	 * handed straight to svelteplot) - see the type's own doc comment for why.
	 */
	static resolve(
		config: OpacityScaleConfig | undefined,
		computedDomain: [number, number] | string[] | undefined,
		defaultRange: [number, number]
	): (value: unknown) => number {
		const domain = config?.domain ?? computedDomain;
		const range = config?.range ?? defaultRange;
		const unknown = config?.unknown ?? 1;

		if (!domain || domain.length === 0) return () => unknown;

		if (typeof range === 'object' && !Array.isArray(range)) {
			return (v) => (v == null ? unknown : (range[String(v)] ?? unknown));
		}

		if (typeof domain[0] === 'string') {
			const categories = domain as string[];
			const [lo, hi] = range;
			return (v) => {
				if (v == null) return unknown;
				const idx = categories.indexOf(String(v));
				if (idx < 0) return unknown;
				return categories.length > 1 ? lo + ((hi - lo) * idx) / (categories.length - 1) : lo;
			};
		}

		const [dLo, dHi] = domain as [number, number];
		const [rLo, rHi] = range;
		return (v) => {
			if (v == null) return unknown;
			const t = ColorRamp.normalize(Number(v), dLo, dHi);
			return rLo + (rHi - rLo) * t;
		};
	}
}

/** The package's public function name, over {@link OpacityScale.resolve}. */
export const resolveOpacityScale = OpacityScale.resolve;
