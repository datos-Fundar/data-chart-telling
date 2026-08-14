import { getContext, setContext } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { LegendInteractionStore } from '$lib/types/layout/legend';

const LEGEND_INTERACTION_KEY = Symbol('dct-legend-interaction');

function blank(): LegendInteractionStore {
  return {
    disabledSeries: new SvelteMap(),
    continuousRange: null,
  };
}

/** Create + register the shared legend-interaction store. Call during component init. */
export function provideLegendInteraction(): LegendInteractionStore {
  const store = $state<LegendInteractionStore>(blank());
  setContext(LEGEND_INTERACTION_KEY, store);
  return store;
}

/**
 * Read the shared legend-interaction store, or `null` when there is no provider.
 *
 * Only resolves correctly when called during a real descendant component's
 * own `<script>` instantiation, not from inside a `{@render}`ed snippet body
 * — snippets run in their author's scope rather than as a fresh component
 * instance. `BaseChart`'s `plot` snippet gets the same data via its `legend`
 * context field instead, which works from either scope.
 */
export function getLegendInteraction(): LegendInteractionStore | null {
  return getContext<LegendInteractionStore | undefined>(LEGEND_INTERACTION_KEY) ?? null;
}

/** A private legend-interaction store for a legend/plot used outside of a {@link BaseChart}. */
export function createLegendInteraction(): LegendInteractionStore {
  const store = $state<LegendInteractionStore>(blank());
  return store;
}
