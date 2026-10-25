import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { DAILY_TEMPERATURE, BUENOS_AIRES_TEMPERATURE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `windowY` transform slides a window of `k` rows along a marker's rows and
// replaces each row's `y` with a reduction of the rows in its window - a moving
// average, by default. The rows stay one per input row, in order, so a `line`
// draws the smoothed curve where the raw one was. `windowX` does the same on `x`.
// Demoed on an empty `LinePlot` canvas so only the markers are on screen.

const meta = {
	title: 'Transforms/Window/Basics',
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

/** The daily readings as faint dots: noisy from one day to the next. */
const rawDots: AxisBasedMarkersConfig = {
	type: 'dot',
	data: BUENOS_AIRES_TEMPERATURE,
	x: 'date',
	y: 'temp',
	styles: { dotRadius: 2, dotFill: '#94a3b8', dotFillOpacity: 0.6, dotStroke: 'none' }
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** A 30-day moving average over the daily readings: the season shows through the day-to-day noise. */
export const MovingAverage: Story = {
	args: {
		markers: [
			rawDots,
			{
				type: 'line',
				data: BUENOS_AIRES_TEMPERATURE,
				x: 'date',
				y: 'temp',
				transforms: [{ type: 'windowY', k: 30 }],
				styles: { stroke: '#dc2626', strokeWidth: 2.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** A larger `k` smooths more: 7 days (orange) still wobbles, 60 days (blue) leaves only the season. */
export const WindowSize: Story = {
	args: {
		markers: [
			rawDots,
			...[
				{ k: 7, stroke: '#ea580c' },
				{ k: 60, stroke: '#2563eb' }
			].map(
				({ k, stroke }): AxisBasedMarkersConfig => ({
					type: 'line',
					data: BUENOS_AIRES_TEMPERATURE,
					x: 'date',
					y: 'temp',
					transforms: [{ type: 'windowY', k }],
					styles: { stroke, strokeWidth: 2 }
				})
			)
		]
	}
};

/**
 * With `grouping`, the window runs per group: each city's average reads only
 * its own days, so the two never blend where they meet in the rows. `color`
 * strokes each city's line like its dots.
 */
export const ByGroup: Story = {
	args: {
		markers: [
			{
				type: 'dot',
				data: DAILY_TEMPERATURE,
				x: 'date',
				y: 'temp',
				color: 'city',
				styles: { dotRadius: 2, dotFillOpacity: 0.35, dotStroke: 'none' }
			},
			{
				type: 'line',
				data: DAILY_TEMPERATURE,
				x: 'date',
				y: 'temp',
				grouping: 'city',
				color: 'city',
				transforms: [{ type: 'windowY', k: 30 }],
				styles: { strokeWidth: 2.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `windowX` smooths `x` instead: here a vertical series, time running up the `y` axis and temperature along `x`. */
export const WindowX: Story = {
	args: {
		scales: {
			x: { label: 'Temperature (°C)' },
			y: { type: 'time', tickFormat: { month: 'short' } }
		},
		markers: [
			{
				type: 'dot',
				data: BUENOS_AIRES_TEMPERATURE,
				x: 'temp',
				y: 'date',
				styles: { dotRadius: 2, dotFill: '#94a3b8', dotFillOpacity: 0.6, dotStroke: 'none' }
			},
			{
				type: 'line',
				data: BUENOS_AIRES_TEMPERATURE,
				x: 'temp',
				y: 'date',
				transforms: [{ type: 'windowX', k: 30 }],
				styles: { stroke: '#dc2626', strokeWidth: 2.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
