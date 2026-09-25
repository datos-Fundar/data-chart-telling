import { resolveColorScale } from '$lib/utils/color';
import type {
	LegendDisabledAction,
	LegendDisabledStyle,
	LegendInteractionStore
} from '$lib/types/layout/legend';
import type { StrokeStyle, DotStyle } from '$lib/types/plots/styling';
import type { ColorScaleConfig } from '$lib/types/layout/scales';

/** Resolves a {@link LegendDisabledAction} into the style a mark should render with — `'omit'` resolves to fully transparent. */
export function resolveDisabledStyle(
	action: LegendDisabledAction | undefined,
	fallbackOpacity: number
): LegendDisabledStyle | undefined {
	if (!action) return undefined;
	if (action.mode === 'omit') return { opacity: 0 };
	return action.style ?? { opacity: fallbackOpacity };
}

/** Drops series toggled off with `disabled: { mode: 'omit' }` from a series list. */
export function omitDisabledSeries<S extends { name: string }>(
	series: S[],
	legendInteraction: LegendInteractionStore | null | undefined
): S[] {
	if (!legendInteraction) return series;
	return series.filter((s) => legendInteraction.disabledSeries.get(s.name)?.mode !== 'omit');
}

/**
 * Resolves each series' own default color, keyed by name — the `color`
 * channel's per-series-identity case (domain = every series name, in order).
 * `scales.color` (scheme/domain/unknown) overrides the theme's own palette
 * cycling when set; computed from the full series list, before
 * {@link omitDisabledSeries} filters it, so colors stay stable regardless of
 * which series are currently toggled off.
 */
export function resolveSeriesColorFor<S extends { name: string }>(
	series: S[],
	colorConfig: ColorScaleConfig | undefined,
	palette: string[]
): (name: string) => string {
	const names = series.map((s) => s.name);
	return resolveColorScale(colorConfig, names, palette);
}

/** Resolves the disabled style for a series by name: legend-off state, falling back to hover-isolate dim. */
export function resolveEffectiveDisabledStyle(
	name: string,
	legendInteraction: LegendInteractionStore | null | undefined,
	disabledOpacity: number,
	hoverIsolate: boolean,
	hoverIsolatedSeries: string | null
): LegendDisabledStyle | undefined {
	return (
		resolveDisabledStyle(legendInteraction?.disabledSeries.get(name), disabledOpacity) ??
		(hoverIsolate && hoverIsolatedSeries && hoverIsolatedSeries !== name
			? { opacity: disabledOpacity }
			: undefined)
	);
}

/**
 * The three per-mark override layers a legend "disabled" state can apply,
 * derived once from a {@link LegendDisabledStyle}. Each is `undefined` when
 * there's no active override, so call sites can slot the result in as just
 * one more `??` layer ahead of their existing segment-style/default-color
 * chain — no branching needed at the call site.
 */

export function disabledStrokeOverride(
	disabled: LegendDisabledStyle | undefined
): StrokeStyle | undefined {
	if (!disabled) return undefined;
	return {
		stroke: disabled.stroke?.stroke,
		strokeWidth: disabled.stroke?.strokeWidth,
		strokeOpacity: disabled.stroke?.strokeOpacity ?? disabled.opacity,
		strokeDasharray: disabled.stroke?.strokeDasharray,
		strokeLinecap: disabled.stroke?.strokeLinecap,
		strokeLinejoin: disabled.stroke?.strokeLinejoin
	};
}

export function disabledDotsOverride(
	disabled: LegendDisabledStyle | undefined
): DotStyle | undefined {
	if (!disabled) return undefined;
	return {
		dotRadius: disabled.dots?.dotRadius,
		dotFill: disabled.dots?.dotFill,
		dotFillOpacity: disabled.dots?.dotFillOpacity ?? disabled.opacity,
		dotSymbol: disabled.dots?.dotSymbol,
		dotStroke: disabled.dots?.dotStroke,
		dotStrokeWidth: disabled.dots?.dotStrokeWidth,
		dotStrokeOpacity: disabled.dots?.dotStrokeOpacity ?? disabled.opacity,
		dotStrokeDasharray: disabled.dots?.dotStrokeDasharray
	};
}

export function disabledFillOverride(
	disabled: LegendDisabledStyle | undefined
): { fill?: string; fillOpacity?: number } | undefined {
	if (!disabled) return undefined;
	return {
		fill: disabled.fill,
		fillOpacity: disabled.fillOpacity ?? disabled.opacity
	};
}
