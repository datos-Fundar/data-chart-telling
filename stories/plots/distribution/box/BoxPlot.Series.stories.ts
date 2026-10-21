import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { BUENOS_AIRES_TRIPS, COMMUTE_TRIPS, type CommuteTrip } from '../../../data/commute-times';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Every series draws one box per category of its rows: the box spans the
// middle half of the values (25th to 75th percentile), the line across it is
// the median, the whiskers reach the farthest values within 1.5 times the
// box's height, and the dots are the values past them. String values on `x`
// stand the boxes upright; on `y` they lie sideways. Grouping by `color`
// draws one box per group, each in its own color.

const meta = {
	title: 'Plots/Distribution/BoxPlot/Series',
	component: BoxPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 500, step: 50 }
		},
		series: {
			description: 'Data series to render.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		}
	},
	parameters: {
		docs: { source: { name: 'BoxPlot' } }
	}
} satisfies Meta<typeof BoxPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** One series, one box per mode of transport: Buenos Aires commute times, in minutes. */
export const Default: Story = {
	args: {
		data: BUENOS_AIRES_TRIPS,
		x: 'mode',
		y: 'minutes'
	}
};

/** `color: 'mode'` makes each mode its own series, so every box takes its own color. */
export const Grouped: Story = {
	args: {
		data: BUENOS_AIRES_TRIPS,
		x: 'mode',
		y: 'minutes',
		color: 'mode'
	}
};

/** The categories on `y` and the minutes on `x` lay the same boxes out sideways. */
export const Horizontal: Story = {
	args: {
		data: BUENOS_AIRES_TRIPS,
		x: 'minutes',
		y: 'mode',
		color: 'mode'
	}
};

/** Pre-built `series`: active modes and motorized ones, each series in its own color over its own categories. */
export const SeriesBased: Story = {
	args: {
		series: [
			{
				name: 'Active',
				x: 'mode',
				y: 'minutes',
				data: BUENOS_AIRES_TRIPS.filter((d) => d.mode === 'Walk' || d.mode === 'Bike')
			},
			{
				name: 'Motorized',
				x: 'mode',
				y: 'minutes',
				data: BUENOS_AIRES_TRIPS.filter((d) => d.mode !== 'Walk' && d.mode !== 'Bike')
			}
		] satisfies Series<CommuteTrip>[]
	}
};

/** `facet: { by: 'city' }` draws one panel per city on a shared scale, so their boxes compare side by side. */
export const FacetedByCity: Story = {
	args: {
		data: COMMUTE_TRIPS,
		x: 'mode',
		y: 'minutes',
		color: 'mode',
		facet: { by: 'city' }
	}
};
