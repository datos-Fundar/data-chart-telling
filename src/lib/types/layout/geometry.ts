/** One resolved segment for scoped-marker rendering - see {@link ScopedMarkerGroup}. */
export type ScopedMarkerSegment<TData> = {
  match: (row: TData) => boolean;
  color: string;
};

/**
 * One series' resolved context for rendering its `series`-scoped `'hover'`/
 * `'component'` markers - built by each `Plot.svelte`, consumed by
 * `GeometryLayout`. Keeps `GeometryLayout` itself agnostic of each plot
 * kind's segment style shape (e.g. `fill` vs `stroke.stroke`).
 */
export type ScopedMarkerGroup<TData> = {
  name: string;
  data: TData[];
  color: string;
  segments: ScopedMarkerSegment<TData>[];
};
