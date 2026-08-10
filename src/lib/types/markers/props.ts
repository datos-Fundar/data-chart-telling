/**
 * Baseline props every marker component receives when mounted by a plot:
 * `data` for the points/values it draws, plus `series`/`seriesColor` when
 * mounted per-series via a `CustomComponentMarkerConfig`. Marker components extend
 * this with whatever else they need (e.g. PeakMarker's `mode`, `label`).
 */
export interface MarkerProps<TData = Record<string, unknown>> {
  data?: TData[];
  series?: string;
  seriesColor?: string;
}
