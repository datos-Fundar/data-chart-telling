import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BoxPlot from '$lib/plots/box/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { AreaStyle } from '$lib/types/plots/styling';
import { BUENOS_AIRES_TRIPS } from '../../data/commute-times';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `segments` restyles some of a series' boxes: each segment's `areas` selects
// the categories it covers, and its `styles` fill just those boxes. Select
// whole categories - a box summarizes the rows it gets, so splitting one
// category's values would draw two smaller boxes. Ungrouped rows form the
// `default` series.

const meta = {
	title: 'Plots/BoxPlot/Segments',
	component: BoxPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: BUENOS_AIRES_TRIPS,
		x: 'mode',
		y: 'minutes'
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

/** The bus box in a strong red, the rest in the default color. */
export const HighlightOne: Story = {
	args: {
		segments: {
			default: [{ areas: [{ x: { from: 'Bus', to: 'Bus' } }], styles: { fill: '#dc2626' } }]
		} satisfies SegmentsConfig<AreaStyle>
	}
};

/** Public transport outlined and faded, so the active and private modes stand out. */
export const Outlined: Story = {
	args: {
		segments: {
			default: [
				{
					areas: [{ x: { from: 'Bus', to: 'Bus' } }, { x: { from: 'Train', to: 'Train' } }],
					styles: { fillOpacity: 0.25, stroke: '#1f2937', strokeWidth: 1 }
				}
			]
		} satisfies SegmentsConfig<AreaStyle>
	}
};
