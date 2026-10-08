import { getContext, setContext } from 'svelte';

const HOVER_SCOPE_KEY = Symbol('dct-hover-scope');

/** Registers the hover-source id of every plot below, one per facet or panel. */
export function provideHoverScope(id: () => string): void {
	setContext(HOVER_SCOPE_KEY, id);
}

/** The enclosing hover scope's id, or `''` outside any. */
export function getHoverScope(): () => string {
	return getContext<(() => string) | undefined>(HOVER_SCOPE_KEY) ?? (() => '');
}
