import { describe, expect, it } from 'vitest';
import { TimelineSteps } from '$lib/layout/timeline/TimelineSteps';

describe('TimelineSteps', () => {
	const steps = new TimelineSteps([2020, 2018, 2020, 2019]);

	it('dedupes and sorts ascending', () => {
		expect(steps.values).toEqual([2018, 2019, 2020]);
		expect(new TimelineSteps([]).values).toEqual([]);
	});

	it("takes the author's values, else the rows' times", () => {
		const rows = [{ y: 3 }, { y: 1 }];
		const time = (r: { y: number }) => r.y;
		expect(TimelineSteps.of([5, 4], rows, time).values).toEqual([4, 5]);
		expect(TimelineSteps.of(undefined, rows, time).values).toEqual([1, 3]);
		expect(TimelineSteps.of([], rows, time).values).toEqual([1, 3]);
	});

	it('spans its first and last step', () => {
		expect(steps.domain).toEqual([2018, 2020]);
		expect(new TimelineSteps([]).domain).toEqual([]);
	});

	it('snaps progress to the nearest step', () => {
		expect(steps.at(0)).toBe(2018);
		expect(steps.at(0.4)).toBe(2019);
		expect(steps.at(1)).toBe(2020);
	});

	it('clamps progress outside 0-1', () => {
		expect(steps.at(-1)).toBe(2018);
		expect(steps.at(2)).toBe(2020);
	});

	it('has no step without steps', () => {
		const none = new TimelineSteps([]);
		expect(none.at(0.5)).toBeUndefined();
		expect(none.nearest(2019)).toBeUndefined();
		expect(none.timeAt(0.5, (t) => t)).toBe(0);
	});

	it('maps eased progress to a continuous time, and a time to its nearest step', () => {
		expect(steps.timeAt(0.5, (t) => t)).toBe(2019);
		expect(steps.timeAt(0.5, (t) => t * t)).toBe(2018.5);
		expect(steps.nearest(2018.6)).toBe(2019);
	});

	it('matches a row at a step, or up to it', () => {
		expect(TimelineSteps.matches(2019, 2019)).toBe(true);
		expect(TimelineSteps.matches(2018, 2019)).toBe(false);
		expect(TimelineSteps.matches(2018, 2019, 'upTo')).toBe(true);
		expect(TimelineSteps.matches(2020, 2019, 'upTo')).toBe(false);
	});
});
