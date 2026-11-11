import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import {
	PENGUIN_COUNTS,
	PENGUIN_ISLANDS,
	PENGUIN_SPECIES,
	type PenguinSpeciesCount
} from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/HeatmapPlot/Scales',
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
		scales: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No scale overrides - both X and Y axes are auto-fitted to the data extent.
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
 * With axis labels - human-readable strings appear alongside each axis,
 * making the heatmap more interpretable.
 */
export const WithAxisLabels: Story = {
	args: {
		series: [
			{
				name: 'penguins',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS
			} satisfies Series<PenguinSpeciesCount>
		],
		scales: {
			x: { label: 'Island' },
			y: { label: 'Species' }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Explicit domain ordering for X axis - ensures PENGUIN_ISLANDS appear in the
 * desired order rather than alphabetically. The `domain` array pins the
 * exact order and set of values shown.
 */
export const ExplicitXDomain: Story = {
	args: {
		series: [
			{
				name: 'penguins',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS
			} satisfies Series<PenguinSpeciesCount>
		],
		scales: {
			x: { domain: PENGUIN_ISLANDS, label: 'Island' },
			y: { domain: PENGUIN_SPECIES, label: 'Species' }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Explicit color domain - pins the colour scale to a fixed `[0, 120]` range
 * instead of auto-fitting to the visible data's min/max. Spreads the colour
 * ramp across the full plausible range of counts, making it easier to
 * read the gradient at a glance rather than always stretching to whichever
 * values happen to be shown.
 */
export const ExplicitColorDomain: Story = {
	args: {
		series: [
			{
				name: 'penguins',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS
			} satisfies Series<PenguinSpeciesCount>
		],
		scales: {
			color: { domain: [0, 120] }
		} satisfies AxisBasedScalesConfig
	}
};

/** A named ramp - `scales.color.scheme: 'warm'` colors the counts from a cool purple to a warm yellow. */
export const NamedColorRamp: Story = {
	args: {
		series: [
			{
				name: 'penguins',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS
			} satisfies Series<PenguinSpeciesCount>
		],
		scales: {
			color: { domain: [0, 120], scheme: 'warm' }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * A ramp of your own - `scheme: [from, to]` runs the colors from the lowest count to the highest: here red for the
 * smallest colonies, green for the largest.
 */
export const CustomColorRamp: Story = {
	args: {
		series: [
			{
				name: 'penguins',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS
			} satisfies Series<PenguinSpeciesCount>
		],
		scales: {
			color: { domain: [0, 120], scheme: ['#ff6b6b', '#51cf66'] }
		} satisfies AxisBasedScalesConfig
	}
};

/** The same ramp the other way round - the order of `scheme` is the order of the values. */
export const InvertedColorRamp: Story = {
	args: {
		series: [
			{
				name: 'penguins',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS
			} satisfies Series<PenguinSpeciesCount>
		],
		scales: {
			color: { domain: [0, 120], scheme: ['#51cf66', '#ff6b6b'] }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Reversed Y axis - PENGUIN_SPECIES appear bottom-to-top instead of top-to-bottom.
 * Useful for matching reading direction or presentation conventions.
 */
export const ReversedY: Story = {
	args: {
		series: [
			{
				name: 'penguins',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS
			} satisfies Series<PenguinSpeciesCount>
		],
		scales: {
			y: { reverse: true },
			color: { domain: [0, 120] }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Rotated X tick labels - makes island labels more readable when they
 * might otherwise overlap on narrow charts.
 */
export const RotatedXTicks: Story = {
	args: {
		series: [
			{
				name: 'penguins',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS
			} satisfies Series<PenguinSpeciesCount>
		],
		scales: {
			x: { tickRotate: -45 },
			color: { domain: [0, 120] }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Combined overrides - labelled axes and explicit domain ordering for both axes.
 */
export const CombinedOverrides: Story = {
	args: {
		series: [
			{
				name: 'penguins',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS
			} satisfies Series<PenguinSpeciesCount>
		],
		scales: {
			x: { domain: PENGUIN_ISLANDS, label: 'Island', tickRotate: -45 },
			y: { domain: PENGUIN_SPECIES, label: 'Species' },
			color: { domain: [0, 120] }
		} satisfies AxisBasedScalesConfig
	}
};
