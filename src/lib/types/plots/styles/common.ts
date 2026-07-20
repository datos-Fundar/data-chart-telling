import type { ValueAnchor } from '$lib/types/plots/constants';
import type { FontStyle } from '$lib/types/plots/styling';

/**
 * Controls if and how value labels are rendered on a plot. The high-level
 * `anchor` sets sensible defaults for placement; the inherited {@link FontStyle}
 * fields (`dx`, `dy`, `textAnchor`, `lineAnchor`, `lineHeight`, `rotate`,
 * `class`, `textClass`, `fill`, …) override those defaults when provided.
 */
export type ValuesStyle = FontStyle & {
  show?: boolean;
  anchor?: ValueAnchor;
  /** Called with the numeric value and the series name. Return a string to render. */
  format?: (value: number, seriesName: string) => string;
};

/**
 * Color overrides for plots that derive their palette from data.
 * Each plot uses only the fields relevant to its kind; unused fields are
 * silently ignored.
 *
 * - `min` / `max` — sequential colour ramp endpoints (heatmap).
 * - `left` / `right` — diverging bar sides (pyramid).
 */
export type ColorsStyle = {
  min?: string;
  max?: string;
  left?: string;
  right?: string;
};

/**
 * Top-level rendering style overrides shared by the non-geo plot kinds.
 * Passed as the `styles` prop. Each plot reads only the fields it cares
 * about.
 */
export type BasePlotStyles = {
  values?: ValuesStyle;
  colors?: ColorsStyle;
};
