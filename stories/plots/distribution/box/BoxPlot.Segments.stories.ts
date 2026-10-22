import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { AreaStyle } from '$lib/types/plots/styling';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `segments` restyles some of a series' boxes: each segment's `areas` selects
// the categories it covers, and its `styles` fill just those boxes. Select
// whole categories - a box summarizes the rows it gets, so splitting one
// category's values would draw two smaller boxes. Ungrouped rows form the
// `default` series.

const meta = {
	title: 'Plots/Distribution/BoxPlot/Segments',
	component: BoxPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: IRIS,
		x: 'species',
		y: 'petalLength'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		segments: { control: false }
	},
	parameters: {
		docs: { source: { name: 'BoxPlot' } }
	}
} satisfies Meta<typeof BoxPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The versicolor box in a strong red, the rest in the default color. */
export const HighlightOne: Story = {
	args: {
		segments: {
			default: [
				{ areas: [{ x: { from: 'versicolor', to: 'versicolor' } }], styles: { fill: '#dc2626' } }
			]
		} satisfies SegmentsConfig<AreaStyle>
	}
};

/** Versicolor and virginica outlined and faded, so setosa stands out. */
export const Outlined: Story = {
	args: {
		segments: {
			default: [
				{
					areas: [
						{ x: { from: 'versicolor', to: 'versicolor' } },
						{ x: { from: 'Train', to: 'Train' } }
					],
					styles: { fillOpacity: 0.25, stroke: '#1f2937', strokeWidth: 1 }
				}
			]
		} satisfies SegmentsConfig<AreaStyle>
	}
};
