import type { TimeValue, TimelineStep } from '$lib/types/layout/timeline';

/** The `dateFormat` tokens and the UTC date part each reads or writes. */
const TOKENS = {
	YYYY: { group: '(\\d{4})', get: (date: Date) => date.getUTCFullYear(), width: 4 },
	MM: { group: '(\\d{1,2})', get: (date: Date) => date.getUTCMonth() + 1, width: 2 },
	DD: { group: '(\\d{1,2})', get: (date: Date) => date.getUTCDate(), width: 2 },
	HH: { group: '(\\d{1,2})', get: (date: Date) => date.getUTCHours(), width: 2 },
	mm: { group: '(\\d{1,2})', get: (date: Date) => date.getUTCMinutes(), width: 2 },
	ss: { group: '(\\d{1,2})', get: (date: Date) => date.getUTCSeconds(), width: 2 }
} as const;

type Token = keyof typeof TOKENS;

const TOKEN_PATTERN = /YYYY|MM|DD|HH|mm|ss/g;

/** An ISO 8601 date, from a bare year to a full date-time. */
const ISO_DATE =
	/^\d{4}(-\d{2}(-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?)?)?$/;

const DAY = 24 * 60 * 60 * 1000;

/** Reads a timeline's values (numbers, `Date`s, ISO or `dateFormat` strings) as numeric steps, and back. */
export class TimelineTime {
	/** @param dateFormat How a non-ISO date string reads, e.g. `'DD/MM/YYYY'`. */
	constructor(readonly dateFormat?: string) {}

	/** A value as its step, or `undefined` when it reads as none. */
	toTime(value: unknown): TimeValue | undefined {
		if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
		if (value instanceof Date) {
			const time = value.getTime();
			return Number.isFinite(time) ? time : undefined;
		}
		if (typeof value !== 'string') return undefined;
		const text = value.trim();
		if (this.dateFormat) {
			const parsed = TimelineTime.#parse(text, this.dateFormat);
			if (parsed !== undefined) return parsed;
		}
		if (text !== '' && Number.isFinite(Number(text)) && !ISO_DATE.test(text)) return Number(text);
		if (ISO_DATE.test(text)) {
			// A bare year stays a year, like a number.
			if (/^\d{4}$/.test(text)) return Number(text);
			const time = Date.parse(/^\d{4}-\d{2}$/.test(text) ? `${text}-01` : text);
			return Number.isFinite(time) ? time : undefined;
		}
		return undefined;
	}

	/** A step as authors see it: a `Date` when `temporal`, else the number. */
	static toStep(value: TimeValue, temporal: boolean): TimelineStep {
		return temporal ? new Date(value) : value;
	}

	/** Whether `values` hold dates rather than plain numbers. */
	isTemporal(values: unknown[]): boolean {
		return values.some((value) => {
			if (value instanceof Date) return true;
			if (typeof value !== 'string') return false;
			const text = value.trim();
			return !/^-?\d+(\.\d+)?$/.test(text) && this.toTime(text) !== undefined;
		});
	}

	/** A step written back in the same form as `like`, for interpolated rows. */
	toValueLike(time: TimeValue, like: unknown): unknown {
		if (like instanceof Date) return new Date(time);
		if (typeof like !== 'string') return time;
		const text = like.trim();
		if (this.dateFormat && TimelineTime.#parse(text, this.dateFormat) !== undefined) {
			return TimelineTime.#write(new Date(time), this.dateFormat);
		}
		if (ISO_DATE.test(text) && !/^\d{4}$/.test(text)) {
			return new Date(time).toISOString().slice(0, text.length);
		}
		return String(time);
	}

	/** A date label as precise as the steps need: year, month, day or time. */
	static dateLabel(steps: TimeValue[], locale?: string): (time: TimeValue) => string {
		const dates = steps.map((time) => new Date(time));
		const options: Intl.DateTimeFormatOptions = dates.every(
			(d) => d.getUTCMonth() === 0 && d.getUTCDate() === 1 && d.getTime() % DAY === 0
		)
			? { year: 'numeric' }
			: dates.every((d) => d.getUTCDate() === 1 && d.getTime() % DAY === 0)
				? { month: 'short', year: 'numeric' }
				: dates.every((d) => d.getTime() % DAY === 0)
					? { day: 'numeric', month: 'short', year: 'numeric' }
					: { dateStyle: 'medium', timeStyle: 'short' };
		const format = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
		return (time) => format.format(new Date(time));
	}

	/** `text` read through `format`, or `undefined` when it does not match. */
	static #parse(text: string, format: string): TimeValue | undefined {
		const order: Token[] = [];
		const pattern = format
			.split(TOKEN_PATTERN)
			.map((literal) => literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
		const tokens = format.match(TOKEN_PATTERN) ?? [];
		let source = pattern[0];
		tokens.forEach((token, index) => {
			order.push(token as Token);
			source += TOKENS[token as Token].group + pattern[index + 1];
		});
		const match = new RegExp(`^${source}$`).exec(text);
		if (!match || !order.length) return undefined;
		const parts: Record<Token, number> = { YYYY: 1970, MM: 1, DD: 1, HH: 0, mm: 0, ss: 0 };
		order.forEach((token, index) => (parts[token] = Number(match[index + 1])));
		return Date.UTC(parts.YYYY, parts.MM - 1, parts.DD, parts.HH, parts.mm, parts.ss);
	}

	/** `date` written through `format`. */
	static #write(date: Date, format: string): string {
		return format.replace(TOKEN_PATTERN, (token) => {
			const { get, width } = TOKENS[token as Token];
			return String(get(date)).padStart(width, '0');
		});
	}
}
