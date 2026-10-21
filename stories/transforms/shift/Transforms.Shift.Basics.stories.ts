import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { BUENOS_AIRES_TEMPERATURE } from '../../data/daily-temperature';
import { MEASUREMENTS } from '../../data/measurements';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `shiftX` transform moves every row's `x` by a fixed amount: a number, or a
// duration on a time axis (`'1 month'`, `'-2 weeks'`). It lines a series up
// against its own past, or offsets copies of a curve. Given one amount per
// channel, `{ x1: '-3 days', x2: '+3 days' }`, it widens each point into an
// interval instead. `shiftY` moves `y`.

const meta = {
	title: 'Transforms/Shift/Basics',
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

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The 30-day average (red), and the same average shifted forward by `'1 month'`
 * (dashed): at every date, the dashed line shows where the average stood a
 * month earlier, so the gap between them is the change over the last month.
 */
export const MonthAgo: Story = {
	args: {
		markers: [
			{
				type: 'line',
				data: BUENOS_AIRES_TEMPERATURE,
				x: 'date',
				y: 'temp',
				transforms: [
					{ type: 'windowY', k: 30 },
					{ type: 'shiftX', by: '1 month' }
				],
				styles: { stroke: '#64748b', strokeWidth: 2, strokeDasharray: '5 4' }
			},
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

/**
 * `{ x1: '-3 days', x2: '+3 days' }` widens one reading a week into a `rect`
 * a week wide, centered on its day, from zero up to the temperature.
 */
export const WidenToInterval: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: BUENOS_AIRES_TEMPERATURE.filter((d) => d.day % 7 === 3),
				x: 'date',
				y1: 0,
				y2: 'temp',
				transforms: [{ type: 'shiftX', by: { x1: '-3 days', x2: '+3 days' } }],
				styles: { fill: '#f97316', fillOpacity: 0.85 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** A numeric `shiftY` offsets one copy of a curve: group B's density lifted by 0.05, so the two shapes stack into a small ridgeline. */
export const Ridgeline: Story = {
	args: {
		scales: { y: { label: 'Density' } },
		markers: [
			{
				type: 'line',
				data: MEASUREMENTS.filter((d) => d.group === 'A'),
				x: 'value',
				transforms: [{ type: 'densityX' }],
				styles: { stroke: '#0d9488', strokeWidth: 2 }
			},
			{
				type: 'line',
				data: MEASUREMENTS.filter((d) => d.group === 'B'),
				x: 'value',
				transforms: [{ type: 'densityX' }, { type: 'shiftY', by: 0.05 }],
				styles: { stroke: '#ea580c', strokeWidth: 2 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
