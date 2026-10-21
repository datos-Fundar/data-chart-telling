import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { WindowYTransform } from '$lib/types/transforms';
import { BUENOS_AIRES_TEMPERATURE } from '../../data/daily-temperature';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The window transforms' options: `reduce` picks what each window becomes (mean,
// median, min, max, …), `anchor` where a row sits in its window, `strict` drops
// windows that run off the ends of the rows, and `interval` measures the window
// in time rather than in rows.

const meta = {
	title: 'Transforms/Window/Options',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: [],
		x: 'x',
		y: 'y',
		scales: {
			x: { type: 'time', tickFormat: { month: 'short' } },
			y: { label: 'Temperature (°C)' }
		}
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const rawDots: AxisBasedMarkersConfig = {
	type: 'dot',
	data: BUENOS_AIRES_TEMPERATURE,
	x: 'date',
	y: 'temp',
	styles: { dotRadius: 2, dotFill: '#94a3b8', dotFillOpacity: 0.6, dotStroke: 'none' }
};

/** One `line` per window, with its own options, in its own color. */
const windowed = (
	options: Omit<WindowYTransform, 'type'>,
	stroke: string,
	data: Record<string, unknown>[] = BUENOS_AIRES_TEMPERATURE
): AxisBasedMarkersConfig => ({
	type: 'line',
	data,
	x: 'date',
	y: 'temp',
	transforms: [{ type: 'windowY', ...options }],
	styles: { stroke, strokeWidth: 2 }
});

// ── Stories ───────────────────────────────────────────────────────────────────

/** `reduce: 'min'` (blue) and `'max'` (red) trace the coldest and warmest day of each 30-day window around the `median` (black). */
export const Reducers: Story = {
	args: {
		markers: [
			rawDots,
			windowed({ k: 30, reduce: 'min' }, '#2563eb'),
			windowed({ k: 30, reduce: 'median' }, '#111827'),
			windowed({ k: 30, reduce: 'max' }, '#dc2626')
		]
	}
};

/**
 * `reduce: 'deviation'`: how much the temperature varies within each 30 days.
 * It rises in autumn and spring, when the season itself moves the temperature
 * within the window, on top of the day-to-day noise.
 */
export const Deviation: Story = {
	args: {
		scales: {
			x: { type: 'time', tickFormat: { month: 'short' } },
			y: { label: 'Std. deviation (°C)' }
		},
		markers: [windowed({ k: 30, reduce: 'deviation' }, '#7c3aed')]
	}
};

/**
 * `anchor` sets where each row sits in its window: `start` (blue) averages the
 * 60 days after it, so it runs ahead of the data; `end` (red) the 60 days
 * before, so it lags - a trailing average. `middle` (black) is centered.
 */
export const Anchor: Story = {
	args: {
		markers: [
			rawDots,
			windowed({ k: 60, anchor: 'start' }, '#2563eb'),
			windowed({ k: 60, anchor: 'middle' }, '#111827'),
			windowed({ k: 60, anchor: 'end' }, '#dc2626')
		]
	}
};

/** `strict: true` leaves out every window short of `k` rows, so the curve stops 30 days short of each end instead of averaging what's left. */
export const Strict: Story = {
	args: {
		markers: [rawDots, windowed({ k: 60, strict: true }, '#dc2626')]
	}
};

/**
 * With `interval`, `k` counts time, not rows. Here only every fifth day is
 * kept in the first half of the year: 10 rows (orange) then span 50 days there
 * and smooth far more, while 10 days (blue) keep the same span all year.
 */
export const Interval: Story = {
	args: {
		markers: (() => {
			const gappy = BUENOS_AIRES_TEMPERATURE.filter((d) => d.day > 180 || d.day % 5 === 0);
			return [
				{ ...rawDots, data: gappy },
				windowed({ k: 10 }, '#ea580c', gappy),
				windowed({ k: 10, interval: 'day' }, '#2563eb', gappy)
			];
		})()
	}
};
