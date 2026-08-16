import { resolveAccessor } from '$lib/plots/utils/accessors';
import { paletteColor } from '$lib/utils/color';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { AxisValue } from '$lib/types/layout/scales';
import type { Series } from '$lib/types/plots/data/common';
import type { HoverPoint } from '$lib/types/layout/tooltip';
import type { BarLayout } from './layout.svelte';

/**
 * Builds hover-marker candidate points for every row across every series.
 *
 * `x`/`y` (the values matching is keyed off) stay the raw category/value so
 * every series at the same category still matches together under the 'x'
 * strategy; `dx`/`dy` only nudge where the matched point is *drawn* — see
 * {@link import('$lib/types/layout/tooltip').HoverDisplayPoint}. For
 * 'stacked' layout, `value` itself is adjusted to the series' cumulative
 * height instead of `dx`/`dy`, since that offset is representable as a
 * regular data value (unlike 'grouped''s pixel-only slice offset).
 */
export function buildHoverPoints<TData extends Record<string, unknown>>(
  resolvedSeries: Series<TData>[],
  isHorizontal: boolean,
  geometry: Pick<BarLayout<TData>, 'layout' | 'stackedBaseline' | 'groupOffset'>,
  palette: string[],
): HoverPoint<TData>[] {
  return resolvedSeries.flatMap((s, idx) => {
    const sx = resolveAccessor(s.x);
    const sy = resolveAccessor(s.y);
    return s.data.filter((d) => !isGapValue(sy(d))).map((d) => {
      const category = sx(d) as AxisValue;
      const rawValue = Number(sy(d));
      const value = geometry.layout === 'stacked' ? geometry.stackedBaseline(category, idx) + rawValue : rawValue;
      const { dx, dy } = geometry.groupOffset(idx);
      return {
        x: isHorizontal ? value : category,
        y: isHorizontal ? category : value,
        dx,
        dy,
        row: d,
        label: String(sy(d)),
        series: s.name,
        color: paletteColor(idx, palette),
      };
    });
  });
}
