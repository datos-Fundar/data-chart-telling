import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { BUENOS_AIRES_TEMPERATURE, type DailyTemperature } from '../../data/daily-temperature';
import { MEASUREMENTS, type Measurement } from '../../data/measurements';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `filter` transform keeps only the rows its `filter` holds for: a per-row
// test, or a field whose value is truthy. Filtering the marker's `data` does the
// same before anything else runs; as a transform, it can run between the others
// - and where it runs changes the result.

const meta = {
	title: 'Transforms/Filter/Basics',
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

/** Every day as a faint dot, for context. */
const allDays: AxisBasedMarkersConfig = {
	type: 'dot',
	data: BUENOS_AIRES_TEMPERATURE,
	x: 'date',
	y: 'temp',
	styles: { dotRadius: 2, dotFill: '#cbd5e1', dotStroke: 'none' }
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** A per-row test: the days above 25 °C, drawn over every day. */
export const Predicate: Story = {
	args: {
		markers: [
			allDays,
			{
				type: 'dot',
				data: BUENOS_AIRES_TEMPERATURE,
				x: 'date',
				y: 'temp',
				transforms: [{ type: 'filter', filter: (d: DailyTemperature) => d.temp > 25 }],
				styles: { dotRadius: 3.5, dotFill: '#dc2626', dotStroke: 'none' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** A field key: `filter: 'rain'` keeps the rows whose `rain` is truthy - the days it rained at all. */
export const FieldKey: Story = {
	args: {
		markers: [
			allDays,
			{
				type: 'dot',
				data: BUENOS_AIRES_TEMPERATURE,
				x: 'date',
				y: 'temp',
				transforms: [{ type: 'filter', filter: 'rain' }],
				styles: { dotRadius: 3, dotFill: '#2563eb', dotStroke: 'none' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Where a filter runs matters. Both lines keep only the first half of the year
 * and average 60 days. Filtered after the window (red), the last averages still
 * read July's days; filtered first (blue), they only see June's, and bend.
 */
export const BeforeOrAfter: Story = {
	args: {
		markers: [
			allDays,
			{
				type: 'line',
				data: BUENOS_AIRES_TEMPERATURE,
				x: 'date',
				y: 'temp',
				transforms: [
					{ type: 'windowY', k: 60 },
					{ type: 'filter', filter: (d: DailyTemperature) => d.day < 181 }
				],
				styles: { stroke: '#dc2626', strokeWidth: 2.5 }
			},
			{
				type: 'line',
				data: BUENOS_AIRES_TEMPERATURE,
				x: 'date',
				y: 'temp',
				transforms: [
					{ type: 'filter', filter: (d: DailyTemperature) => d.day < 181 },
					{ type: 'windowY', k: 60 }
				],
				styles: { stroke: '#2563eb', strokeWidth: 2.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Composed with a density: the filter picks group A first, so the estimate only sees its rows. */
export const BeforeADensity: Story = {
	args: {
		scales: { y: { label: 'Density' } },
		markers: [
			{
				type: 'area',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [
					{ type: 'filter', filter: (d: Measurement) => d.group === 'A' },
					{ type: 'densityX' }
				],
				styles: { fill: '#0d9488', fillOpacity: 0.4 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
