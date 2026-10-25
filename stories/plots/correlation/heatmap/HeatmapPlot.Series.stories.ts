import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { PENGUIN_COUNTS, type PenguinSpeciesCount } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/HeatmapPlot/Series',
	component: HeatmapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		series: { control: false },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Single series with explicit series object - data is grouped into one series
 * with x, y, color dimensions mapping to 'island', 'species', and 'count' fields.
 *
 * The heatmap displays how many penguins of each species live on each island.
 */
export const Default: Story = {
	args: {
		series: [
			{
				name: 'penguins',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS
			} satisfies Series<PenguinSpeciesCount>
		]
	}
};

/**
 * Alternative data structure - the same grid built from two separate
 * per-species series instead of one combined array. Each series only carries
 * its own rows of cells; `HeatmapPlot` merges every series' data onto the
 * same x/y/color accessors before drawing.
 */
export const TwoSeriesBySpecies: Story = {
	args: {
		series: [
			{
				name: 'adelie',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS.filter((d) => d.species === 'Adelie')
			} satisfies Series<PenguinSpeciesCount>,
			{
				name: 'others',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS.filter((d) => d.species !== 'Adelie')
			} satisfies Series<PenguinSpeciesCount>
		]
	}
};

/**
 * Using data + x + y + color shorthand - alternative to passing a series array.
 * Equivalent to the Default story but with less boilerplate.
 */
export const UsingDataShorthand: Story = {
	args: {
		data: PENGUIN_COUNTS,
		x: 'island',
		y: 'species',
		color: 'count'
	}
};
