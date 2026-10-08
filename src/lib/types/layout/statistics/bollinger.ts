import type { StrokeStyle } from '$lib/types/plots/styling';

/** Band options for `type: 'bollinger'` - mirrors svelteplot's own `BollingerOptions` field-for-field. */
export type BollingerStatisticOptions = {
	/** Window size (the moving average's own `k`); svelteplot's default is 20. */
	n?: number;
	/** Band radius, a multiple of standard deviations; svelteplot's default is 2. */
	k?: number;
	/**
	 * `stroke`/`strokeOpacity` style the moving-average line; `bandFill`
	 * styles the ±k·σ band - confirmed empirically as the only two style
	 * channels svelteplot's own `BollingerX`/`Y` actually route through
	 * (`strokeWidth` and the rest of `StrokeStyle` are accepted but have no
	 * visible effect on the line, so deliberately not offered here).
	 */
	styles?: Pick<StrokeStyle, 'stroke' | 'strokeOpacity'> & { bandFill?: string };
};
