import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { PENGUIN_COUNTS, type PenguinSpeciesCount } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/HeatmapPlot/Segments',
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
		segments: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const SERIES = [
	{
		name: 'penguins',
		x: 'island',
		y: 'species',
		color: 'count',
		data: PENGUIN_COUNTS
	} satisfies Series<PenguinSpeciesCount>
];

// ── Stories ───────────────────────────────────────────────────────────────────
// Heatmap segments use the `'default'` key - heatmaps have no named series.
// `from`/`to` compare category values lexicographically, so islands fall in
// alphabetical order: Biscoe, Dream, Torgersen.

/**
 * Highlight a region - outlines the Adelie cells of a range of islands.
 * Useful for focusing on a particular slice of the data.
 */
export const HighlightRegion: Story = {
	args: {
		series: SERIES,
		segments: {
			default: [
				{
					areas: [
						{
							x: { from: 'Biscoe', to: 'Dream' },
							y: { from: 'Adelie', to: 'Adelie' }
						}
					],
					styles: { stroke: '#000', strokeWidth: 3 }
				}
			]
		} satisfies SegmentsConfig<CellSegmentStyle>
	}
};

/**
 * Highlight a row (species) - every Adelie cell is outlined.
 */
export const HighlightSpecies: Story = {
	args: {
		series: SERIES,
		segments: {
			default: [
				{
					areas: [{ y: { from: 'Adelie', to: 'Adelie' } }],
					styles: { stroke: '#000', strokeWidth: 3 }
				}
			]
		} satisfies SegmentsConfig<CellSegmentStyle>
	}
};

/**
 * Highlight columns (islands) - all cells in specific islands are outlined,
 * leaving every fill as the count draws it.
 */
export const HighlightIslands: Story = {
	args: {
		series: SERIES,
		segments: {
			default: [
				{
					areas: [
						{ x: { from: 'Biscoe', to: 'Biscoe' } },
						{ x: { from: 'Torgersen', to: 'Torgersen' } }
					],
					styles: { stroke: '#000', strokeWidth: 3 }
				}
			]
		} satisfies SegmentsConfig<CellSegmentStyle>
	}
};

/**
 * Multiple highlight areas with different strokes - creates a visual
 * hierarchy by outlining some regions more strongly than others.
 */
export const LayeredStrokes: Story = {
	args: {
		series: SERIES,
		segments: {
			default: [
				{
					areas: [
						{
							x: { from: 'Biscoe', to: 'Dream' },
							y: { from: 'Adelie', to: 'Adelie' }
						}
					],
					styles: { stroke: '#000', strokeWidth: 3 }
				},
				{
					areas: [
						{
							x: { from: 'Dream', to: 'Torgersen' },
							y: { from: 'Gentoo', to: 'Gentoo' }
						}
					],
					styles: { stroke: '#000', strokeWidth: 1.5, strokeDasharray: '4 3' }
				}
			]
		} satisfies SegmentsConfig<CellSegmentStyle>
	}
};

/**
 * Highlight with a custom stroke - the color and width of the border are
 * the segment's own.
 */
export const HighlightWithStroke: Story = {
	args: {
		series: SERIES,
		segments: {
			default: [
				{
					areas: [
						{
							x: { from: 'Biscoe', to: 'Biscoe' },
							y: { from: 'Adelie', to: 'Adelie' }
						}
					],
					styles: { stroke: '#f59f00', strokeWidth: 4 }
				}
			]
		} satisfies SegmentsConfig<CellSegmentStyle>
	}
};
