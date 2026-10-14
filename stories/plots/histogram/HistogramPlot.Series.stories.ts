import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HistogramPlot from '$lib/plots/histogram/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { MEASUREMENTS, type Measurement } from '../../data/measurements';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A histogram bins the rows of each series on `x`, one bar per bin, its height the
// bin's count - or on `y`, when that's the only channel given, for horizontal bars. Flat `data` is one histogram; `grouping` (or `color`) splits it into
// one histogram per group, drawn in each group's color. A pre-built `series` array
// does the same without grouping.

const meta = {
	title: 'Plots/HistogramPlot/Series',
	component: HistogramPlot,
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
			description: 'Data series to bin; each one gets its own histogram.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		},
		transforms: {
			description:
				'svelteplot transforms run on every histogram. A `binX` here is merged over the default one, its own props winning.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'HistogramPlot' } }
	}
} satisfies Meta<typeof HistogramPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Flat rows, one histogram: every measurement binned on `value`, each bar the number of rows in its bin. */
export const Default: Story = {
	args: {
		data: MEASUREMENTS,
		x: 'value'
	}
};

/** Only `y`, no `x`: the plot bins along `y` (a `binY`) and draws horizontal bars, each as long as its bin's count. */
export const Horizontal: Story = {
	args: {
		data: MEASUREMENTS,
		y: 'value'
	}
};

/** `grouping: 'group'` splits the rows into one histogram per group. `segments: { default: [{ styles: { fillOpacity: 0.7 } }] }` makes every group's bars translucent, so the group behind shows through where they overlap. */
export const Grouped: Story = {
	args: {
		data: MEASUREMENTS,
		x: 'value',
		grouping: 'group',
		segments: { default: [{ styles: { fillOpacity: 0.7 } }] }
	}
};

/** The same groups with `transforms: [{ type: 'stackY' }]`: each bin's bars stack on each other, so a bin's top is the total of both groups. */
export const GroupedStacked: Story = {
	args: {
		data: MEASUREMENTS,
		x: 'value',
		grouping: 'group',
		transforms: [{ type: 'stackY' }]
	}
};

/** A pre-built `series` array: each series is binned on its own, the same result as `grouping`. */
export const SeriesBased: Story = {
	args: {
		series: [
			{
				name: 'Group A',
				x: 'value',
				y: 'value',
				data: MEASUREMENTS.filter((d: Measurement) => d.group === 'A')
			},
			{
				name: 'Group B',
				x: 'value',
				y: 'value',
				data: MEASUREMENTS.filter((d: Measurement) => d.group === 'B')
			}
		] satisfies Series<Measurement>[]
	}
};
