import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { INFLATION_RANGES } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A ForestPlot's own connectors and dots are its marks. A `rule` marker adds a
// reference line across them, drawn on top.

const meta = {
	title: 'Plots/Ranking/ForestPlot/Markers/Rule',
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
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ForestPlot' } }
	}
} satisfies Meta<typeof ForestPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A dashed rule at 5%: a forest plot's line of reference. */
export const Reference: Story = {
	args: {
		markers: [
			{
				type: 'rule',
				axis: 'x',
				value: 5,
				styles: { strokeDasharray: '4 4', strokeOpacity: 0.7 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
