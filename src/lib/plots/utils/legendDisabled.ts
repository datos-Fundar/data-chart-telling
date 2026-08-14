import type { LegendDisabledStyle } from '$lib/types/layout/legend';
import type { StrokeStyle, DotStyle } from '$lib/types/plots/styling';

/**
 * The three per-mark override layers a legend "disabled" state can apply,
 * derived once from a {@link LegendDisabledStyle}. Each is `undefined` when
 * there's no active override, so call sites can slot the result in as just
 * one more `??` layer ahead of their existing segment-style/default-color
 * chain — no branching needed at the call site.
 */

export function disabledStrokeOverride(disabled: LegendDisabledStyle | undefined): StrokeStyle | undefined {
  if (!disabled) return undefined;
  return {
    stroke: disabled.stroke?.stroke,
    strokeWidth: disabled.stroke?.strokeWidth,
    strokeOpacity: disabled.stroke?.strokeOpacity ?? disabled.opacity,
    strokeDasharray: disabled.stroke?.strokeDasharray,
    strokeLinecap: disabled.stroke?.strokeLinecap,
    strokeLinejoin: disabled.stroke?.strokeLinejoin,
  };
}

export function disabledDotsOverride(disabled: LegendDisabledStyle | undefined): DotStyle | undefined {
  if (!disabled) return undefined;
  return {
    dotRadius: disabled.dots?.dotRadius,
    dotFill: disabled.dots?.dotFill,
    dotFillOpacity: disabled.dots?.dotFillOpacity ?? disabled.opacity,
    dotSymbol: disabled.dots?.dotSymbol,
    dotStroke: disabled.dots?.dotStroke,
    dotStrokeWidth: disabled.dots?.dotStrokeWidth,
    dotStrokeOpacity: disabled.dots?.dotStrokeOpacity ?? disabled.opacity,
    dotStrokeDasharray: disabled.dots?.dotStrokeDasharray,
  };
}

export function disabledFillOverride(
  disabled: LegendDisabledStyle | undefined,
): { fill?: string; fillOpacity?: number } | undefined {
  if (!disabled) return undefined;
  return {
    fill: disabled.fill,
    fillOpacity: disabled.fillOpacity ?? disabled.opacity,
  };
}
