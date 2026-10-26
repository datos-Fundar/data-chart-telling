import type { Meta, StoryObj } from '@storybook/svelte-vite';
import RaincloudPlot from '$lib/plots/distribution/raincloud/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { AreaStyle } from '$lib/types/plots/styling';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `segments` restyles some of a series' rainclouds: each segment's `areas`
// selects the categories it covers, and its `styles` fill just those clouds and
// their dots. Select whole categories - a cloud estimates the rows it gets, so
// splitting one category's values would draw two smaller clouds. Ungrouped rows
// form the `default` series.

const meta = {
	title: 'Plots/Distribution/RaincloudPlot/Segments',
	component: RaincloudPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: IRIS,
		x: 'species',
		y: 'sepalLength'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		segments: { control: false }
	},
	parameters: {
		docs: { source: { name: 'RaincloudPlot' } }
	}
} satisfies Meta<typeof RaincloudPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The versicolor cloud and its dots in a strong red, the rest in the default color. */
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
						{ x: { from: 'virginica', to: 'virginica' } }
					],
					styles: { fillOpacity: 0.2, stroke: '#1f2937', strokeWidth: 1 }
				}
			]
		} satisfies SegmentsConfig<AreaStyle>
	}
};
