/**
 * GeoPlot's own margin default - a small, uniform gap on every side, unlike
 * `AUTO_MARGIN_ESTIMATE`'s asymmetric axis-tick-label estimate (extra room
 * on the left/bottom for y tick labels and an x-axis title). A map has no
 * axes to make room for, so borrowing that estimate just left GeoPlot with
 * a lopsided, oversized margin - most visibly a much taller gap under the
 * map than an `inset` marker's own default `margin` (see `insetLayout.ts`),
 * even though both are meant to read as the same edge gap. Matching this
 * constant to that 8px inset default keeps the two visually aligned.
 */
export const GEO_MARGIN_ESTIMATE = { top: 8, right: 8, bottom: 8, left: 8 } as const;
