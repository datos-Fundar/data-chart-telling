import type { AxisValue } from '$lib/types/layout/scales';
import type { DotStyle, FontStyle } from '$lib/types/plots/styling';
import type { ColorsStyle } from '$lib/types/layout/styles';

/**
 * A set of point marks (svelteplot's `Dot`) — usable on any plot kind, axis-based or geo.
 *
 * `x`/`y`/`r`/`value` accept a field key or an accessor function, like `Series.x`/`y`.
 * `GeometryLayout` resolves the shorthand before it reaches `DotMarker.svelte`, which only
 * ever sees functions.
 */
export type DotMarkerConfig = {
  type: 'dot';
  data: Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x: string | ((d: any) => AxisValue);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y: string | ((d: any) => AxisValue);
  /** Per-row radius, or a constant — overrides `style.dotRadius`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  r?: number | string | ((d: any) => number);
  /** Per-row fill, overriding `style.dotFill` — ignored when `value` is set. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fill?: (d: any) => string;
  /** Continuous value driving a per-dot color ramp through `style.colors`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: string | ((d: any) => number);
  style?: DotStyle & { colors?: ColorsStyle };
};

/**
 * A text label per row (svelteplot's `Text`) — usable on any plot kind, axis-based or geo.
 *
 * `x`/`y` accept the same field-key-or-function shorthand as `DotMarkerConfig`. `text` is a
 * constant or a per-row accessor.
 */
export type TextMarkerConfig = {
  type: 'text';
  data: Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x: string | ((d: any) => AxisValue);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y: string | ((d: any) => AxisValue);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: string | ((d: any) => string);
  style?: FontStyle;
};

/**
 * Every marker kind usable on any plot, axis-based or geo. `AxisBasedMarkersConfig`
 * (`types/markers/common.ts`) and `GeoMarkersConfig` (`types/markers/geo.ts`) both extend
 * this, so `MarkerConfig` (`types/markers/all.ts`) can union the two without a shape collision.
 */
export type BaseMarkersConfig = DotMarkerConfig | TextMarkerConfig;
