import type { ValueAnchor } from '$lib/types/plots/constants';
import type { FontStyle, StrokeStyle } from '$lib/types/plots/styling';

/**
 * Controls if and how value labels are rendered on a plot. The high-level
 * `anchor` sets sensible defaults for placement; `fontStyle` (`dx`, `dy`,
 * `textAnchor`, `lineAnchor`, `lineHeight`, `rotate`, `class`, `textClass`,
 * `fill`, …) overrides those defaults field-by-field when provided — mirrors
 * {@link DeltaConfig}'s `fontStyle`/`strokeStyle` split, so label text and
 * connector-line styling never mix into one flat bag of props.
 */
export type ValuesStyle = {
  show?: boolean;
  anchor?: ValueAnchor;
  /** Called with the numeric value and the series name. Return a string to render. */
  format?: (value: number, seriesName: string) => string;
  /** Text styling for the label itself. */
  fontStyle?: FontStyle;
  /**
   * Style for the leader line drawn from a label displaced to clear an
   * overlap with another series' label, back to its real data point.
   * Labels only ever move when they'd otherwise collide — this is a no-op
   * style until that happens. Falls back to a neutral grey, thin, solid
   * stroke — deliberately not the series' own colour or stroke width, since
   * matching the data line reads as more data rather than as a leader,
   * right where several lines are already converging. Unset fields keep
   * that fallback.
   */
  strokeStyle?: StrokeStyle;
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
