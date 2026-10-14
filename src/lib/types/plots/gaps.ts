import type { EasingName } from '$lib/types/misc/easing';
import type { AxisValue } from '$lib/types/layout/mapping';

/** How one gap zone is bridged: `interpolate` eases the value (default `'linear'`), `style` draws it. */
export type GapZoneConfig<TStyle> = {
	interpolate?: EasingName;
	style?: TStyle;
};

/**
 * A gap before the first or after the last real point: bridged out to `x`
 * (required to fill it), reaching `y` there (default: the nearest real
 * value). On bar plots only `x`'s presence matters.
 */
export type OpenGapZoneConfig<TStyle> = GapZoneConfig<TStyle> & {
	x: AxisValue;
	y?: AxisValue;
};

/** One series' gap fill: `start`, `middle` and `end`. A row is missing when its value is `null`, `undefined` or `NaN`. */
export type GapZonesConfig<TStyle> = {
	start?: OpenGapZoneConfig<TStyle>;
	middle?: GapZoneConfig<TStyle>;
	end?: OpenGapZoneConfig<TStyle>;
};

/** `styles.gaps`: series name (or `'default'`) to its {@link GapZonesConfig}; `'default'` fills the zones a named entry leaves unset. */
export type GapsConfig<TStyle> = Record<string, GapZonesConfig<TStyle>>;

/** A point sampled along a gap-fill bridge, already resolved to plot data-space numbers. */
export type GapPoint = { x: number; y: number };

/** One gap row's resolved fill - the interpolated value to render instead of the missing one, and which zone produced it. */
export type DiscreteGapFill<TStyle> = {
  value: number;
  kind: 'start' | 'middle' | 'end';
  style?: TStyle;
};
