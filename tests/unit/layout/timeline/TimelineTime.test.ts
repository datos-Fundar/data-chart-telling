import { describe, test, expect } from 'vitest';
import { TimelineTime } from '$lib/layout/timeline/TimelineTime';

const time = new TimelineTime();

describe('TimelineTime.toTime', () => {
	test('a number is itself, a Date its timestamp', () => {
		expect(time.toTime(2020)).toBe(2020);
		expect(time.toTime(new Date(Date.UTC(2023, 4, 1)))).toBe(Date.UTC(2023, 4, 1));
	});

	test('a numeric string is its number, a bare ISO year its year', () => {
		expect(time.toTime('2020')).toBe(2020);
		expect(time.toTime(' 3.5 ')).toBe(3.5);
	});

	test('an ISO date string is its UTC timestamp, at whatever precision it has', () => {
		expect(time.toTime('2023-05')).toBe(Date.UTC(2023, 4, 1));
		expect(time.toTime('2023-05-17')).toBe(Date.UTC(2023, 4, 17));
		expect(time.toTime('2023-05-17T10:30:00Z')).toBe(Date.UTC(2023, 4, 17, 10, 30));
	});

	test('anything it cannot read is no step', () => {
		expect(time.toTime('17/05/2023')).toBeUndefined();
		expect(time.toTime('May 2023')).toBeUndefined();
		expect(time.toTime(null)).toBeUndefined();
		expect(time.toTime(new Date('nope'))).toBeUndefined();
		expect(time.toTime(NaN)).toBeUndefined();
	});

	test('`dateFormat` reads the strings it does not detect', () => {
		expect(new TimelineTime('DD/MM/YYYY').toTime('17/05/2023')).toBe(Date.UTC(2023, 4, 17));
		expect(new TimelineTime('MM-YYYY').toTime('5-2023')).toBe(Date.UTC(2023, 4, 1));
		expect(new TimelineTime('YYYY.MM.DD HH:mm').toTime('2023.05.17 10:30')).toBe(
			Date.UTC(2023, 4, 17, 10, 30)
		);
	});

	test('with a `dateFormat`, ISO strings and numbers still read', () => {
		const dmy = new TimelineTime('DD/MM/YYYY');
		expect(dmy.toTime('2023-05-17')).toBe(Date.UTC(2023, 4, 17));
		expect(dmy.toTime(2020)).toBe(2020);
	});
});

describe('TimelineTime.isTemporal', () => {
	test('dates and date strings are, numbers and numeric strings are not', () => {
		expect(time.isTemporal([new Date()])).toBe(true);
		expect(time.isTemporal(['2023-05'])).toBe(true);
		expect(time.isTemporal([2020, 2021])).toBe(false);
		expect(time.isTemporal(['2020', '2021'])).toBe(false);
		expect(new TimelineTime('DD/MM/YYYY').isTemporal(['17/05/2023'])).toBe(true);
	});
});

describe('TimelineTime.toValueLike', () => {
	const may17 = Date.UTC(2023, 4, 17);

	test('writes a step back the way the timeline holds its values', () => {
		expect(time.toValueLike(may17, new Date(0))).toEqual(new Date(may17));
		expect(time.toValueLike(may17, '2020-01-01')).toBe('2023-05-17');
		expect(time.toValueLike(Date.UTC(2023, 4, 1), '2020-01')).toBe('2023-05');
		expect(time.toValueLike(2021.5, 2020)).toBe(2021.5);
		expect(new TimelineTime('DD/MM/YYYY').toValueLike(may17, '01/01/2020')).toBe('17/05/2023');
	});
});

describe('TimelineTime.dateLabel', () => {
	const label = (steps: number[]) => TimelineTime.dateLabel(steps, 'en-US');

	test('years when every step is a January 1st', () => {
		const steps = [Date.UTC(2021, 0, 1), Date.UTC(2022, 0, 1)];
		expect(label(steps)(steps[1])).toBe('2022');
	});

	test('months when every step is a 1st', () => {
		const steps = [Date.UTC(2023, 0, 1), Date.UTC(2023, 4, 1)];
		expect(label(steps)(steps[1])).toBe('May 2023');
	});

	test('days when every step is midnight', () => {
		const steps = [Date.UTC(2023, 4, 1), Date.UTC(2023, 4, 17)];
		expect(label(steps)(steps[1])).toBe('May 17, 2023');
	});

	test('dates with their time otherwise', () => {
		const steps = [Date.UTC(2023, 4, 17, 10, 30)];
		expect(label(steps)(steps[0])).toMatch(/May 17, 2023.*10:30/);
	});
});
