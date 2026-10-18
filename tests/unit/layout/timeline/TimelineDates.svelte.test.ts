import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { TimelineTime } from '$lib/layout/timeline/TimelineTime';

const REGIONS = ['North', 'Center', 'South'];
const MONTHS = [Date.UTC(2023, 0, 1), Date.UTC(2023, 1, 1), Date.UTC(2023, 2, 1)];

/** One row per region and month, its month written by `write`. */
function rows(write: (time: number) => unknown) {
	return MONTHS.flatMap((time, month) =>
		REGIONS.map((region, index) => ({
			region,
			month: write(time),
			value: 10 * (month + 1) + index
		}))
	);
}

/** How the default label writes a month, in the configured locale. */
const monthLabel = (time: number) =>
	TimelineTime.dateLabel(MONTHS, getConfiguration().axis.locale)(time);

async function renderAt(data: Record<string, unknown>[], progress: number, dateFormat?: string) {
	const { container } = render(BarPlot, {
		width: 480,
		height: 320,
		data,
		x: 'region',
		y: 'value',
		timeline: {
			accessor: 'month',
			dateFormat,
			progress,
			player: { controls: ['value'] }
		}
	} as never);
	await expect.poll(() => container.querySelector('.dct-player__value')).not.toBeNull();
	return container;
}

const label = (container: Element) =>
	container.querySelector('.dct-player__value')!.textContent!.trim();
const barCount = (container: Element) =>
	container.querySelectorAll('g.bar-y rect, g.bar-y path').length;

describe('a timeline of dates', () => {
	const cases: Record<string, { data: Record<string, unknown>[]; dateFormat?: string }> = {
		'`Date`s': { data: rows((time) => new Date(time)) },
		'ISO strings': { data: rows((time) => new Date(time).toISOString().slice(0, 7)) },
		'strings read through `dateFormat`': {
			data: rows((time) => {
				const date = new Date(time);
				return `01/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;
			}),
			dateFormat: 'DD/MM/YYYY'
		}
	};

	for (const [name, { data, dateFormat }] of Object.entries(cases)) {
		test(`steps through ${name} one month at a time, reading each as a month`, async () => {
			const first = await renderAt(data, 0, dateFormat);
			expect(label(first)).toBe(monthLabel(MONTHS[0]));
			await expect.poll(() => barCount(first)).toBe(REGIONS.length);

			const last = await renderAt(data, 1, dateFormat);
			expect(label(last)).toBe(monthLabel(MONTHS[2]));
			await expect.poll(() => barCount(last)).toBe(REGIONS.length);
		});
	}

	test('a year timeline still reads its steps as plain numbers', async () => {
		const data = REGIONS.map((region, index) => ({
			region,
			month: 2020 + index,
			value: index + 1
		}));
		const container = await renderAt(data, 1);
		expect(label(container)).toBe('2022');
	});
});
