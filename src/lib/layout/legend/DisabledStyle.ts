import type { LegendDisabledAction, LegendDisabledStyle } from '$lib/types/layout/legend';
import type { DotStyle, StrokeStyle } from '$lib/types/plots/styling';

/**
 * How a legend's "disabled" state draws a mark. Each of {@link fill},
 * {@link stroke} and {@link dots} is `undefined` when nothing is disabled, so
 * a call site slots it in as one more `??` layer ahead of its own style chain.
 */
export class DisabledStyle {
	/** The style `action` draws a mark with - `'hide'` and `'omit'` are fully transparent. */
	static of(
		action: LegendDisabledAction | undefined,
		fallbackOpacity: number
	): LegendDisabledStyle | undefined {
		if (!action) return undefined;
		if (action.mode !== 'dim') return { opacity: 0 };
		return action.style ?? { opacity: fallbackOpacity };
	}

	/** The style a legend item draws with while off - it stays visible, so it can be turned back on. */
	static ofItem(
		action: LegendDisabledAction | undefined,
		fallbackOpacity: number
	): LegendDisabledStyle | undefined {
		if (!action) return undefined;
		return action.mode === 'dim'
			? DisabledStyle.of(action, fallbackOpacity)
			: { opacity: fallbackOpacity };
	}

	static stroke(disabled: LegendDisabledStyle | undefined): StrokeStyle | undefined {
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

	static dots(disabled: LegendDisabledStyle | undefined): DotStyle | undefined {
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

	static fill(
		disabled: LegendDisabledStyle | undefined
	): { fill?: string; fillOpacity?: number } | undefined {
		if (!disabled) return undefined;
		return {
			fill: disabled.fill,
			fillOpacity: disabled.fillOpacity ?? disabled.opacity
		};
	}
}
