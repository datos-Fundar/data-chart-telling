import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { BUENOS_AIRES_TEMPERATURE } from '../../data/daily-temperature';
import { SURVEY_ANSWERS } from '../../data/survey-ratings';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An `intervalX` transform widens each row's `x` into the interval around it:
// floored to the interval as `x1`, and the next interval's start as `x2`. A
// `rect` then spans the whole day, month or bucket, like a bar on a continuous
// axis, and its value is drawn up from zero. `intervalY` does the same on `y`.
// Chained after a `groupX` with the same `interval`, it draws one bar per bucket.

const meta = {
	title: 'Transforms/Interval/Basics',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: [],
		x: 'x',
		y: 'y',
		scales: { x: { type: 'time', tickFormat: { month: 'short' } }, y: { label: 'Rain (mm)' } }
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

// ── Stories ───────────────────────────────────────────────────────────────────

/** `interval: 'day'`: each day's rain as a bar exactly one day wide, on a time axis. */
export const Daily: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: BUENOS_AIRES_TEMPERATURE,
				x: 'date',
				y: 'rain',
				transforms: [{ type: 'intervalX', interval: 'day' }],
				styles: { fill: '#2563eb' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** A `groupX` sums each month's rain first, then `intervalX` widens each sum into its month: one bar per month. */
export const Monthly: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: BUENOS_AIRES_TEMPERATURE,
				x: 'date',
				y: 'rain',
				transforms: [
					{ type: 'groupX', y: 'sum', interval: 'month' },
					{ type: 'intervalX', interval: 'month' }
				],
				styles: { fill: '#0d9488' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `intervalY` on the other axis: the monthly sums as horizontal bars, each one a month tall. */
export const IntervalY: Story = {
	args: {
		scales: {
			x: { label: 'Rain (mm)' },
			y: { type: 'time', tickFormat: { month: 'short' }, reverse: true }
		},
		markers: [
			{
				type: 'rect',
				data: BUENOS_AIRES_TEMPERATURE,
				x: 'rain',
				y: 'date',
				transforms: [
					{ type: 'groupY', x: 'sum', interval: 'month' },
					{ type: 'intervalY', interval: 'month' }
				],
				styles: { fill: '#7c3aed' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** A numeric interval: respondents counted per decade of age, each bar ten years wide. */
export const Numeric: Story = {
	args: {
		scales: { x: { label: 'Age' }, y: { label: 'Respondents' } },
		markers: [
			{
				type: 'rect',
				data: SURVEY_ANSWERS,
				x: 'age',
				transforms: [
					{ type: 'groupX', y: 'count', interval: 10 },
					{ type: 'intervalX', interval: 10 }
				],
				styles: { fill: '#ea580c' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
