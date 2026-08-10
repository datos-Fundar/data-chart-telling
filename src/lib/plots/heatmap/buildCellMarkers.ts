import type { AxisValue } from '$lib/types/plots/axis';
import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
import type { CellMarkerConfig } from '$lib/types/markers/common';

/** One resolved-style bucket of cells, as grouped by `HeatmapPlot`'s own `styleGroups`. */
export type CellStyleGroup<TData> = { style: CellSegmentStyle; data: TData[] };

/**
 * Every `'cell'` marker for one HeatmapPlot render: one marker per
 * resolved-style bucket in `styleGroups`. `fill` stays a per-row accessor,
 * falling back to `colorScale` wherever a segment doesn't set a literal
 * `fill`.
 */
export function buildCellMarkers<TData extends Record<string, unknown>>(args: {
  styleGroups: CellStyleGroup<TData>[];
  getX: (d: TData) => AxisValue;
  getY: (d: TData) => AxisValue;
  getZ: (d: TData) => AxisValue;
  colorScale: (value: number) => string;
}): CellMarkerConfig[] {
  const { styleGroups, getX, getY, getZ, colorScale } = args;
  return styleGroups.map((group) => ({
    type: 'cell',
    data: group.data,
    x: getX,
    y: getY,
    fill: (d: TData) => group.style.fill ?? colorScale(Number(getZ(d))),
    style: {
      fillOpacity: group.style.fillOpacity ?? 1,
      stroke: group.style.stroke,
      strokeWidth: group.style.strokeWidth ?? 0,
    },
    inset: 0.5,
  }));
}
