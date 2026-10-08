import { getContext, setContext } from 'svelte';
import type { TimeValue } from '$lib/types/layout/timeline';

const COMPOSER_KEY = Symbol('dct-composer');
const SHARED_TIMELINE_KEY = Symbol('dct-shared-timeline');

/** What a `PlotComposer` offers the panels inside it. */
export type ComposerContext = {
	/** Registers a panel, returning its 0-based order; an inset doesn't take a cell of the grid. */
	register: (inset: boolean) => number;
	/** The tag stamped on the `index`-th panel, if the composer tags them. */
	tagOf: (index: number) => string | undefined;
	/** The composer's own hover-scope id, so nested panels get unique ones. */
	scope: () => string;
};

export function provideComposer(context: ComposerContext): void {
	setContext(COMPOSER_KEY, context);
}

/** The enclosing `PlotComposer`, or `null` outside one. */
export function getComposer(): ComposerContext | null {
	return getContext<ComposerContext | undefined>(COMPOSER_KEY) ?? null;
}

/** A scrubber position every plot with a `timeline` below follows instead of drawing its own. */
export type SharedTimeline = { progress: () => number; values: () => TimeValue[] };

export function provideSharedTimeline(timeline: SharedTimeline): void {
	setContext(SHARED_TIMELINE_KEY, timeline);
}

/** The enclosing shared timeline, or `null` without one. */
export function getSharedTimeline(): SharedTimeline | null {
	return getContext<SharedTimeline | undefined>(SHARED_TIMELINE_KEY) ?? null;
}

const ROMAN: [number, string][] = [
	[10, 'X'],
	[9, 'IX'],
	[5, 'V'],
	[4, 'IV'],
	[1, 'I']
];

function roman(n: number): string {
	let out = '';
	for (const [value, numeral] of ROMAN) {
		while (n >= value) {
			out += numeral;
			n -= value;
		}
	}
	return out;
}

/** The `index`-th tag of a tag sequence. */
export function buildTag(tags: string | string[], index: number): string | undefined {
	if (Array.isArray(tags)) return tags[index];
	if (tags === 'A') return String.fromCharCode(65 + (index % 26));
	if (tags === 'a') return String.fromCharCode(97 + (index % 26));
	if (tags === 'I') return roman(index + 1);
	if (tags === 'i') return roman(index + 1).toLowerCase();
	return String(index + 1);
}
