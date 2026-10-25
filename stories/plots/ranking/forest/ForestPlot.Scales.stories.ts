import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import { INFLATION_RANGES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The value axis fits the intervals, not the estimates alone; the category axis lists
// the rows in the order the data gives them, unless `sort` orders them.

const meta = {
	title: 'Plots/Ranking/ForestPlot/Scales',
	component: ForestPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 480,
		data: INFLATION_RANGES,
		x: 'mean',
		y: 'period',
		lower: 'min',
		upper: 'max',
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		scales: { description: 'Per-axis scale configuration.', control: false }
	},
	parameters: {
		docs: { source: { name: 'ForestPlot' } }
	}
} satisfies Meta<typeof ForestPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Axis labels replace the field names. */
export const Labels: Story = {
	args: {
		scales: { x: { label: 'Monthly inflation (%)' }, y: { label: false } }
	}
};

/** `sort` orders every row by its estimate, the highest first, whatever its region. */
export const SortedByEstimate: Story = {
	args: {
		scales: { y: { sort: { by: 'value', order: 'descending' } } }
	}
};

/** `grouped: true` keeps each region together and orders the rows within it. */
export const SortedByEstimateWithinRegion: Story = {
	args: {
		scales: { y: { sort: { by: 'value', order: 'descending', grouped: true } } }
	}
};

/** `sort: { by: 'range' }` orders every row by the width of its interval: the least certain first. */
export const SortedByWidth: Story = {
	args: {
		scales: { y: { sort: { by: 'range', order: 'descending' } } }
	}
};

/** Width within each region: the regions stay together, their widest intervals first. */
export const SortedByWidthWithinRegion: Story = {
	args: {
		scales: { y: { sort: { by: 'range', order: 'descending', grouped: true } } }
	}
};

/** A pinned `x` domain from zero shows every interval against it. */
export const FromZero: Story = {
	args: {
		scales: { x: { domain: [0, 30] } }
	}
};
