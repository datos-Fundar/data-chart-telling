import { getContext, setContext } from 'svelte';
import type { XValue } from '$lib/types/plots/common';
import type { TooltipSync } from '$lib/types/charts/tooltip';

/**
 * Shared hover state for cross-facet tooltip syncing.
 *
 * {@link Chart} provides one store via context; every faceted plot reads the
 * same instance, so a hover detected in one facet (which writes `activeX/Y` and
 * stamps itself as `source`) is visible to the others. A standalone plot with no
 * provider falls back to its own {@link createHover} store.
 */
export type HoverStore = {
  activeX: XValue | null;
  activeY: XValue | null;
  /** Facet id that currently owns the hover (`''` when not faceted). */
  source: string | null;
  sync: TooltipSync;
};

const HOVER_KEY = Symbol('dct-hover');

function blank(): HoverStore {
  return { activeX: null, activeY: null, source: null, sync: 'none' };
}

/** Create + register the shared hover store. Call during component init. */
export function provideHover(): HoverStore {
  const store = $state<HoverStore>(blank());
  setContext(HOVER_KEY, store);
  return store;
}

/** Read the shared hover store, or `null` when there is no provider. */
export function getHover(): HoverStore | null {
  return getContext<HoverStore | undefined>(HOVER_KEY) ?? null;
}

/** A private hover store for a plot used outside of a {@link Chart}. */
export function createHover(): HoverStore {
  const store = $state<HoverStore>(blank());
  return store;
}
