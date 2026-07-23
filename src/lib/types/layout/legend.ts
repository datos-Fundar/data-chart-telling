import type { SvelteMap } from 'svelte/reactivity';
import type { LegendDisabledStyle } from '$lib/types/charts/legend';

/**
 * Shared legend-interaction state for cross-cutting legend → plot wiring.
 *
 * {@link BaseChart} provides one store via context (mirrors {@link HoverStore});
 * `DiscreteSection`/`ContinuousSection` write to it on click/drag, and every
 * plot kind (line/bar/pyramid/heatmap/geo) reads the same instance to know
 * what to dim. A standalone legend/plot with no provider falls back to its
 * own private store via `createLegendInteraction`.
 */
export type LegendInteractionStore = {
  /** Legend item name → resolved style to apply. Presence in the map means "disabled". */
  disabledSeries: SvelteMap<string, LegendDisabledStyle>;
  /**
   * The active drag state of the (first) interactive continuous section, or
   * `null` when none is interactive or the user hasn't narrowed it yet (full
   * range — nothing hidden).
   */
  continuousRange: {
    min: number;
    max: number;
    mode: 'rescale' | 'filter';
    disabledStyle: LegendDisabledStyle;
  } | null;
};
