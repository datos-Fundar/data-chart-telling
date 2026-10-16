import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { TransformReducer } from '$lib/types/transforms';
import { BUENOS_AIRES_TEMPERATURE, DAILY_TEMPERATURE } from '../../data/daily-temperature';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A group's reducer turns each group's values into one: by name (`count`, `sum`,
// `mean`, `median`, `min`, `max`, `deviation`, `p25`…`p99` for percentiles, …)
// or as a function of the group's values. With an `interval`, `groupX` groups
// by time period, not by each distinct date: here a year of daily readings
// reduced to twelve months.

const meta = {
	title: 'Transforms/Group/Reducers',
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

/** One month's reduction of Buenos Aires' readings, as a `line` with `dot`s, in its own color. */
const monthly = (reducer: TransformReducer, stroke: string): AxisBasedMarkersConfig[] => {
	const shared = {
		data: BUENOS_AIRES_TEMPERATURE,
		x: 'date',
		y: 'temp',
		transforms: [{ type: 'groupX' as const, y: reducer, interval: 'month' }]
	};
	return [
		{ type: 'line', ...shared, styles: { stroke, strokeWidth: 2 } },
		{ type: 'dot', ...shared, styles: { dotRadius: 4, dotFill: stroke, dotStroke: 'white' } }
	];
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** `min` (blue), `mean` (black) and `max` (red) of each month: the month's range around its average. */
export const MinMeanMax: Story = {
	args: {
		markers: [
			...monthly('min', '#2563eb'),
			...monthly('mean', '#111827'),
			...monthly('max', '#dc2626')
		]
	}
};

/** Percentiles by name: `p10` (blue) and `p90` (red) bound the middle 80% of each month's days, around the `median` (black). */
export const Percentiles: Story = {
	args: {
		markers: [
			...monthly('p10', '#2563eb'),
			...monthly('median', '#111827'),
			...monthly('p90', '#dc2626')
		]
	}
};

/** A function reducer: the share of each month's days above 20 °C, from 0 to 1. */
export const FunctionReducer: Story = {
	args: {
		scales: {
			x: { type: 'time', tickFormat: { month: 'short' } },
			y: { label: 'Share of days above 20 °C', domain: [0, 1] }
		},
		markers: monthly(
			(temps: number[]) => temps.filter((t) => t > 20).length / temps.length,
			'#ea580c'
		)
	}
};

/** `sum` of each month's `rain` as `rect`s, one month wide, per city - `grouping` keeps the cities' months apart, and a `stackY` puts one on the other. */
export const MonthlySum: Story = {
	args: {
		scales: {
			x: { type: 'time', tickFormat: { month: 'short' } },
			y: { label: 'Rain (mm)' }
		},
		markers: [
			{
				type: 'rect',
				data: DAILY_TEMPERATURE,
				x: 'date',
				y: 'rain',
				grouping: 'city',
				color: 'city',
				transforms: [
					{ type: 'groupX', y: 'sum', interval: 'month' },
					{ type: 'intervalX', interval: 'month' },
					{ type: 'stackY' }
				],
				styles: { fillOpacity: 0.85 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
