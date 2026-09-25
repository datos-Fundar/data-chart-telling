import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import { COUNTRIES } from '../../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The `color` channel: a plot-level `color` accessor plus `scales.color`
// drives every default mark's fill — here, ScatterPlot's own dots. This is the
// discrete categorical case: `color` groups series by name (region), and
// `scales.color` maps those category names to specific colors.

const meta = {
	title: 'Channels/Color/Plot Level/Scatter',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		r: 6
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `color: 'region'` groups the data by region (Americas, Europe, Asia, Africa)
 * and feeds each series name into the plot's own `scales.color` ramp — the
 * default palette cycles through colors automatically for each region.
 */
export const Default: Story = {
	args: {
		color: 'region'
	}
};

/** `scales.color.scheme` maps region names to specific colors, overriding the default palette. */
export const CustomScheme: Story = {
	args: {
		color: 'region',
		scales: {
			color: {
				scheme: {
					Americas: '#7c3aed',
					Europe: '#0891b2',
					Asia: '#ea580c',
					Africa: '#059669'
				}
			}
		}
	}
};
