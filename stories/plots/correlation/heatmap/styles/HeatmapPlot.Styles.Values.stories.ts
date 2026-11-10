import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { PENGUIN_COUNTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/HeatmapPlot/Styles/Values',
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
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No style overrides - the plot uses the configured theme defaults.
 * Cell values are displayed and color ramp is auto-selected.
 */
export const Default: Story = {
	args: {
		data: PENGUIN_COUNTS,
		x: 'island',
		y: 'species',
		color: 'count'
	}
};

/**
 * Hide cell value labels - `styles.values.show: false` removes the numeric
 * labels from each cell, useful when cells are small or data density is high.
 */
export const NoValueLabels: Story = {
	args: {
		data: PENGUIN_COUNTS,
		x: 'island',
		y: 'species',
		color: 'count',
		scales: {
			color: { domain: [0, 120] }
		},
		styles: {
			values: { show: false }
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Custom value format - the `format(value)` callback controls how cell values
 * are displayed. Here each count is shown followed by the unit.
 */
export const CustomValueFormat: Story = {
	args: {
		data: PENGUIN_COUNTS,
		x: 'island',
		y: 'species',
		color: 'count',
		scales: {
			color: { domain: [0, 120] }
		},
		styles: {
			values: { format: (v: number) => `${v} penguins` }
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Only the largest count, called out above its cell (`layout: 'point'`, `select: 'max'`) - every cell still reads by
 * its color.
 */
export const OnlyTheLargest: Story = {
	args: {
		data: PENGUIN_COUNTS,
		x: 'island',
		y: 'species',
		color: 'count',
		styles: {
			values: {
				layout: 'point',
				anchor: 'top',
				side: 'above',
				select: 'max',
				format: (v: number) => `${v} penguins`
			}
		}
	}
};
