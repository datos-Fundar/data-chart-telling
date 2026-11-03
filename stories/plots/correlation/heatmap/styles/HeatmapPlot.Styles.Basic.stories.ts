import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import { PENGUIN_COUNTS } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.area` is the look of every cell, over the color its value gives it. A `fill` there would replace that color, so leave it to `color`.

const meta = {
	title: 'Plots/Correlation/HeatmapPlot/Styles/Basic',
	component: HeatmapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: PENGUIN_COUNTS,
		x: 'island',
		y: 'species',
		color: 'count'
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 100, max: 700, step: 50 }
		},
		styles: {
			description: '`styles.area`: a style returning the look of every cell.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A midnightblue outline around every cell. */
export const CellBorders: Story = {
	args: {
		styles: { area: { stroke: 'midnightblue', strokeWidth: 3 } }
	}
};

/** Translucent cells. */
export const TranslucentCells: Story = {
	args: {
		styles: { area: { fillOpacity: 0.6 } }
	}
};
