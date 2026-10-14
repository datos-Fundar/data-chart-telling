import type { EasingFn } from '$lib/types/misc/easing';
import type { TimeValue } from '$lib/types/layout/timeline';

/**
 * A timeline's distinct steps, ascending: where a scrubber `progress`
 * (`0`-`1`) lands on them, the span they cover and which rows a step shows.
 */
export class TimelineSteps {
	readonly values: TimeValue[];

	constructor(values: Iterable<TimeValue>) {
		this.values = [...new Set(values)].sort((a, b) => a - b);
	}

	/** The steps the author listed in `values` or, without any, the times of `rows`. */
	static of<TRow>(
		values: TimeValue[] | undefined,
		rows: TRow[],
		getTime: (row: TRow) => TimeValue
	): TimelineSteps {
		return new TimelineSteps(values?.length ? values : rows.map(getTime));
	}

	/** Whether a row at time `value` shows in `step`: at it, or up to it. */
	static matches(value: unknown, step: TimeValue, mode: 'exact' | 'upTo' = 'exact'): boolean {
		return mode === 'upTo' ? Number(value) <= step : Number(value) === step;
	}

	get first(): TimeValue | undefined {
		return this.values[0];
	}

	get last(): TimeValue | undefined {
		return this.values[this.values.length - 1];
	}

	/** The first and last step - empty without any. */
	get domain(): TimeValue[] {
		const { first, last } = this;
		return first === undefined || last === undefined ? [] : [first, last];
	}

	/** The step a scrubber `progress` snaps to, or `undefined` without steps. */
	at(progress: number): TimeValue | undefined {
		const { values } = this;
		if (!values.length) return undefined;
		const index = Math.round(progress * (values.length - 1));
		return values[Math.min(values.length - 1, Math.max(0, index))];
	}

	/** The continuous time `progress` is at across the steps, eased - `0` without steps. */
	timeAt(progress: number, easing: EasingFn): number {
		const { first, last } = this;
		if (first === undefined || last === undefined) return 0;
		return first + (last - first) * easing(progress);
	}

	/** The step closest to `time`, or `undefined` without steps. */
	nearest(time: number): TimeValue | undefined {
		return this.values.reduce<TimeValue | undefined>(
			(best, step) =>
				best === undefined || Math.abs(step - time) < Math.abs(best - time) ? step : best,
			undefined
		);
	}
}
