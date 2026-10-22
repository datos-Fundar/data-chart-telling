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
 * Highlight a region - dims all cells except the Adelie row for a range of
 * islands. Useful for focusing on a particular slice of the data.
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
					styles: { fillOpacity: 1 }
				},
				{
					styles: { fillOpacity: 0.3 }
				}
			]
		} satisfies SegmentsConfig<CellSegmentStyle>
	}
};

/**
 * Highlight a row (species) - every Adelie cell is highlighted with full opacity;
 * the other rows are dimmed.
 */
export const HighlightSpecies: Story = {
	args: {
		series: SERIES,
		segments: {
			default: [
				{
					areas: [{ y: { from: 'Adelie', to: 'Adelie' } }],
					styles: { fillOpacity: 0.95 }
				},
				{
					styles: { fillOpacity: 0.25 }
				}
			]
		} satisfies SegmentsConfig<CellSegmentStyle>
	}
};

/**
 * Highlight columns (islands) - all cells in specific islands are shown
 * at full brightness; others are faded.
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
					styles: { fillOpacity: 1 }
				},
				{
					styles: { fillOpacity: 0.3 }
				}
			]
		} satisfies SegmentsConfig<CellSegmentStyle>
	}
};

/**
 * Multiple highlight areas with different opacities - creates a visual
 * hierarchy by dimming some regions more than others.
 */
export const LayeredOpacity: Story = {
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
					styles: { fillOpacity: 1 }
				},
				{
					areas: [
						{
							x: { from: 'Dream', to: 'Torgersen' },
							y: { from: 'Gentoo', to: 'Gentoo' }
						}
					],
					styles: { fillOpacity: 0.6 }
				},
				{
					styles: { fillOpacity: 0.25 }
				}
			]
		} satisfies SegmentsConfig<CellSegmentStyle>
	}
};

/**
 * Highlight with custom stroke - draws attention to a region with both
 * opacity and a visible border.
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
					styles: {
						fillOpacity: 0.9,
						stroke: '#f59f00',
						strokeWidth: 2
					}
				},
				{
					styles: { fillOpacity: 0.3 }
				}
			]
		} satisfies SegmentsConfig<CellSegmentStyle>
	}
};
