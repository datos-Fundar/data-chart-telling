import type { EasingName } from '$lib/types/charts/interpolate';
import type { AxisValue } from '$lib/types/layout/scales';

/**
 * How one gap zone bridges its hole: `interpolate` eases the synthetic
 * segment's value between its two endpoints (defaults to `'linear'`, a
 * straight line); `style` is the per-mark shape drawn for it
 * ({@link LineSegmentStyle} for `LinePlot`), independent of that plot
 * kind's own default marker style unless the caller repeats it.
 */
export type GapZoneConfig<TStyle> = {
  interpolate?: EasingName;
  style?: TStyle;
};

/**
 * A leading/trailing gap has only one real boundary — `x` (required to opt
 * in) is the domain value the synthetic segment extends to, and `y` is the
 * value it reaches there (defaults to holding the nearest real point's
 * value, i.e. a flat extrapolation). Omitting the zone entirely leaves that
 * end of the series unfilled — extrapolating without an explicit target
 * would imply data that doesn't exist.
 */
export type OpenGapZoneConfig<TStyle> = GapZoneConfig<TStyle> & {
  x: AxisValue;
  y?: AxisValue;
};

/**
 * One series' gap-fill config: `start` (before its first real point),
 * `middle` (any internal run of missing rows, bounded by real data on both
 * sides) and `end` (after its last real point). A row counts as missing
 * when its resolved value is `null`, `undefined`, or `NaN` — the same
 * convention svelteplot's own `Line` mark already uses to break the line
 * there. See {@link GapsConfig} (`types/plots/props.ts`) for how this is
 * keyed per series on `LinePlot`'s own `gaps` prop.
 */
export type GapZonesConfig<TStyle> = {
  start?: OpenGapZoneConfig<TStyle>;
  middle?: GapZoneConfig<TStyle>;
  end?: OpenGapZoneConfig<TStyle>;
};
