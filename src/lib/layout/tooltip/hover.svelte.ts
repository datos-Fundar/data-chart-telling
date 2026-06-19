import { getContext, setContext } from 'svelte';
import type { HoverStore } from '$lib/types/layout/tooltip';

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
