import { getContext, setContext } from 'svelte';
import type { TimeValue } from '$lib/types/layout/timeline';

const SHARED_TIMELINE_KEY = Symbol('dct-shared-timeline');

/** A scrubber position every plot with a `timeline` below follows instead of drawing its own, each read reactively. */
export class SharedTimeline {
	readonly progress: () => number;
	readonly values: () => TimeValue[];

	constructor(inputs: { progress: () => number; values: () => TimeValue[] }) {
		this.progress = inputs.progress;
		this.values = inputs.values;
	}

	/** The enclosing shared timeline, or `null` without one. Call during component init. */
	static current(): SharedTimeline | null {
		return getContext<SharedTimeline | undefined>(SHARED_TIMELINE_KEY) ?? null;
	}

	/** A new shared timeline for every plot below. Call during component init. */
	static provide(inputs: ConstructorParameters<typeof SharedTimeline>[0]): SharedTimeline {
		const timeline = new SharedTimeline(inputs);
		setContext(SHARED_TIMELINE_KEY, timeline);
		return timeline;
	}
}
