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
  /** The series' id, when it differs from its name - see `Series.id`. */
  id?: string;
  /** The facet panel the series belongs to. */
  panel?: string;
  data: TData[];
  color: string;
  segments: ScopedMarkerSegment<TData>[];
};
