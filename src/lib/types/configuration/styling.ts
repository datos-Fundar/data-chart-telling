import type { StrokeStyle, DotStyle, FontStyle, AreaStyle } from '$lib/types/plots/styling';

export type TextStyle = {
  /** font-family */
  font: string;
  /** font-size (any CSS length) */
  size: string;
  /** font-weight */
  weight: number | string;
  /** color */
  color: string;
  /** line-height */
  leading: string;
  /** letter-spacing */
  spacing: string;
};

export type ChartConfig = {
  // ── Base ──────────────────────────────────────────────────────────────────
  font: string;
  color: string;
  background: string;
  border: string;

  // ── Spacing / padding ───────────────────────────────────────────────────────
  spacing: {
    headerPadding: string;
    legendPadding: string;
    captionPadding: string;
  };

  // ── Text blocks ─────────────────────────────────────────────────────────────
  title: TextStyle;
  subtitle: TextStyle;
  caption: TextStyle;

  // ── Legend ──────────────────────────────────────────────────────────────────
  legend: {
    font: string;
    size: string;
    weight: number | string;
    color: string;
    titleSize: string;
    titleWeight: number | string;
    /** row/column gap between sections (CSS `gap` shorthand) */
    gap: string;
    /** swatch square size */
    swatchSize: string;
    /** Fallback opacity for a legend-disabled series/value when a section doesn't set its own `disabledStyle`. */
    disabledOpacity: number;
  };

  // ── Axes (consumed by plots) ────────────────────────────────────────────────
  axis: {
    color: string;
    fontSize: number;
    labelFontSize: number;
    titleFontSize: number;
    xTickSize: number;
    yTickSize: number;
    xTickPadding: number;
    yTickPadding: number;
    grid: boolean;
  };

  // ── Tooltip ─────────────────────────────────────────────────────────────────
  tooltip: {
    background: string;
    color: string;
    fontSize: string;
    padding: string;
    radius: string;
    border: string;
  };

  // ── Plot geometry / colour ──────────────────────────────────────────────────
  /**
   * Per-side plot margin. `'auto'` (the default) lets svelteplot size that
   * side to fit whatever it actually renders there — tick labels, an axis
   * title, rotated ticks — instead of clipping content or leaving unused
   * space. A number pins that side exactly, opting out of auto-sizing.
   */
  margins: { top: number | 'auto'; right: number | 'auto'; bottom: number | 'auto'; left: number | 'auto' };
  /** Discrete categorical palette (grouped series). */
  palette: string[];
  /** Continuous gradient endpoints + on-cell label colour. */
  continuous: { min: string; max: string; labelColor: string };
  /** Default line geometry. */
  line: {
    strokeWidth: number;
    dotRadius: number;
    /**
     * End-of-line value-label declutter geometry and connector styling —
     * `LinePlot`-specific, since only line charts spread colliding
     * end-point labels apart with elbow-routed leader lines.
     */
    valueLabels: {
      /** Shortest lane's distance (px) from the data point before a leader line bends. */
      elbowGap: number;
      /** Extra distance (px) each subsequent lane sits out from the last. */
      laneStep: number;
      /** Clearance (px) between the outermost lane and the label text it feeds into. */
      labelGap: number;
      /** Default leader-line colour — overridable per-plot via `styles.values.strokeStyle`. */
      connectorColor: string;
      /** Default leader-line width — overridable per-plot via `styles.values.strokeStyle`. */
      connectorWidth: number;
    };
  };
  /** Timeline gutter styling. */
  timeline: { axisColor: string; activeColor: string; thickness: number };
  /** In-SVG hover highlight: crosshair rule, dot + value label, and geo feature restyle. */
  hover: { rule: StrokeStyle; dot: DotStyle; font: FontStyle; area: AreaStyle };
};

/** Deep-partial input accepted by `setConfiguration`. */
export type ChartConfigInput = DeepPartial<ChartConfig>;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};
