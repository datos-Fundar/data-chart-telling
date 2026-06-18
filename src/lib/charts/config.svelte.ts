/**
 * Global, reactive styling configuration for the whole package.
 *
 * One source of truth feeds two consumers:
 *   1. HTML chrome (container, legend, caption, tooltip) reads it as **CSS
 *      custom properties** — {@link configToCssVars} flattens the config and
 *      {@link ChartContainer} stamps the variables on its root so the scoped
 *      `<style>` blocks resolve them.
 *   2. Plots read it as **plain JS values** for the props svelteplot needs as
 *      numbers/strings (margins, tick font sizes, palette, gradient endpoints).
 *
 * Because the store is a module-level Svelte `$state`, calling
 * {@link setConfiguration} re-renders every chart on screen.
 */

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
  };

  // ── Axes (consumed by plots) ────────────────────────────────────────────────
  axis: {
    color: string;
    fontSize: number;
    labelFontSize: number;
    tickSize: number;
    tickPadding: number;
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
  margins: { top: number; right: number; bottom: number; left: number };
  /** Discrete categorical palette (grouped series). */
  palette: string[];
  /** Continuous gradient endpoints + on-cell label colour. */
  continuous: { min: string; max: string; labelColor: string };
  /** Default line geometry. */
  line: { strokeWidth: number; dotRadius: number };
  /** Timeline gutter styling. */
  timeline: { axisColor: string; activeColor: string; thickness: number };
};

/** Deep-partial input accepted by {@link setConfiguration}. */
export type ChartConfigInput = DeepPartial<ChartConfig>;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

// ── Defaults ────────────────────────────────────────────────────────────────
// Mirror the values the components shipped with, so adopting the config system
// is visually a no-op until something is overridden.

const text = (over: Partial<TextStyle>): TextStyle => ({
  font: 'inherit',
  size: '1rem',
  weight: 400,
  color: 'inherit',
  leading: '1.3',
  spacing: 'normal',
  ...over,
});

export const DEFAULT_CONFIG: ChartConfig = {
  font: 'inherit',
  color: 'currentColor',
  background: 'transparent',
  border: 'color-mix(in srgb, currentColor 15%, transparent)',

  spacing: {
    headerPadding: '0.75rem 0 1rem',
    legendPadding: '0.75rem 0',
    captionPadding: '0.5rem 0',
  },

  title: text({ size: '1.5rem', weight: 500, leading: '1.2' }),
  subtitle: text({ size: '1rem', weight: 400, color: 'color-mix(in srgb, currentColor 85%, transparent)' }),
  caption: text({ size: '0.75rem', color: 'color-mix(in srgb, currentColor 75%, transparent)' }),

  legend: {
    font: 'inherit',
    size: '0.875rem',
    weight: 400,
    color: 'inherit',
    titleSize: '0.875rem',
    titleWeight: 500,
    gap: '0.5rem 2rem',
    swatchSize: '1.25rem',
  },

  axis: {
    color: 'currentColor',
    fontSize: 14,
    labelFontSize: 14,
    tickSize: 5,
    tickPadding: 10,
    grid: false,
  },

  tooltip: {
    background: '#111827',
    color: '#ffffff',
    fontSize: '0.8125rem',
    padding: '0.5rem 0.75rem',
    radius: '0.375rem',
    border: 'none',
  },

  margins: { top: 20, right: 20, bottom: 30, left: 40 },
  palette: ['#4f46e5', '#e6580d', '#16a34a', '#dc2626', '#0891b2', '#9333ea', '#ca8a04', '#db2777'],
  continuous: { min: '#e0e7ff', max: '#4f46e5', labelColor: '#111827' },
  line: { strokeWidth: 3, dotRadius: 4 },
  timeline: { axisColor: 'currentColor', activeColor: '#e6580d', thickness: 60 },
};

// ── Merge ─────────────────────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function merge<T>(base: T, patch: DeepPartial<T>): T {
  const out = { ...(base as Record<string, unknown>) };
  for (const key in patch) {
    const pv = (patch as Record<string, unknown>)[key];
    if (pv === undefined) continue;
    const bv = out[key];
    out[key] = isPlainObject(bv) && isPlainObject(pv) ? merge(bv, pv) : pv;
  }
  return out as T;
}

// ── Reactive store ──────────────────────────────────────────────────────────

let current = $state<ChartConfig>(structuredClone(DEFAULT_CONFIG));

/** Read the live, reactive configuration. */
export function getConfiguration(): ChartConfig {
  return current;
}

/** Deep-merge a partial override into the global configuration. Reactive. */
export function setConfiguration(patch: ChartConfigInput): ChartConfig {
  current = merge(current, patch);
  return current;
}

/** Restore the shipped defaults. */
export function resetConfiguration(): void {
  current = structuredClone(DEFAULT_CONFIG);
}

// ── CSS variable bridge ───────────────────────────────────────────────────────

/** Flatten a config into the `--dct-*` custom properties used by the styles. */
export function configToCssVars(c: ChartConfig): Record<string, string> {
  const t = (prefix: string, s: TextStyle): Record<string, string> => ({
    [`--dct-${prefix}-font`]: s.font,
    [`--dct-${prefix}-size`]: s.size,
    [`--dct-${prefix}-weight`]: String(s.weight),
    [`--dct-${prefix}-color`]: s.color,
    [`--dct-${prefix}-leading`]: s.leading,
    [`--dct-${prefix}-spacing`]: s.spacing,
  });

  return {
    '--dct-font': c.font,
    '--dct-fg': c.color,
    '--dct-bg': c.background,
    '--dct-border': c.border,

    '--dct-header-pad': c.spacing.headerPadding,
    '--dct-legend-pad': c.spacing.legendPadding,
    '--dct-caption-pad': c.spacing.captionPadding,

    ...t('title', c.title),
    ...t('subtitle', c.subtitle),
    ...t('caption', c.caption),

    '--dct-legend-font': c.legend.font,
    '--dct-legend-size': c.legend.size,
    '--dct-legend-weight': String(c.legend.weight),
    '--dct-legend-color': c.legend.color,
    '--dct-legend-title-size': c.legend.titleSize,
    '--dct-legend-title-weight': String(c.legend.titleWeight),
    '--dct-legend-gap': c.legend.gap,
    '--dct-legend-swatch': c.legend.swatchSize,

    '--dct-axis-color': c.axis.color,

    '--dct-tooltip-bg': c.tooltip.background,
    '--dct-tooltip-color': c.tooltip.color,
    '--dct-tooltip-size': c.tooltip.fontSize,
    '--dct-tooltip-pad': c.tooltip.padding,
    '--dct-tooltip-radius': c.tooltip.radius,
    '--dct-tooltip-border': c.tooltip.border,

    '--dct-timeline-axis': c.timeline.axisColor,
    '--dct-timeline-active': c.timeline.activeColor,

    '--dct-heat-min': c.continuous.min,
    '--dct-heat-max': c.continuous.max,
    '--dct-heat-text': c.continuous.labelColor,
  };
}

/** Serialize a CSS-vars record into a `style` attribute string. */
export function cssVarsStyle(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}
