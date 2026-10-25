import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import { HEIGHTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering a bar shows the bin it covers: its edges, its count, and its group
// when the histogram is grouped. `tooltip` turns it on and sets its anchor and
// strategy, the same way it does for the other plots.

const meta = {
	title: 'Plots/Distribution/HistogramPlot/Tooltip',
	component: HistogramPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height',
		transforms: [{ type: 'binX', thresholds: 12 }]
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
		tooltip: {
			description: 'Tooltip runtime configuration.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'HistogramPlot' } }
	}
} satisfies Meta<typeof HistogramPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The bin's edges and count, and its group when the histogram is grouped. */
const TOOLTIP = {
	sync: false,
	format: (row: Record<string, unknown>) => {
		const range = `${Number(row.from).toFixed(1)} to ${Number(row.to).toFixed(1)}`;
		const group = row.group === undefined ? '' : ` · ${String(row.group)}`;
		return `${range}: ${String(row.count)} rows${group}`;
	}
};

/** A tooltip on each bar: hover a bar to read its count. */
export const Default: Story = {
	args: {
		tooltip: TOOLTIP
	}
};

/** Grouped, each bin has a bar per group, and hovering one shows its own group. */
export const Grouped: Story = {
	args: {
		grouping: 'group',
		tooltip: TOOLTIP
	}
};
