import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import { LIFE_EXPECTANCY_BY_PROVINCE } from '../../../plots/bar/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The `color` channel: a plot-level `color` accessor plus `scales.color`
// drives every default mark's fill — here, BarPlot's own bars. This is the
// discrete categorical case: `color` groups series by name, and `scales.color`
// maps those category names to specific colors via a `scheme` record.

const meta = {
	title: 'Channels/Color/Plot Level/Bar',
	component: BarPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `color: 'sex'` groups the data by sex (male/female) and feeds each series
 * name into the plot's own `scales.color` ramp — the default palette cycles
 * through colors automatically for each series.
 */
export const Default: Story = {
	args: {
		color: 'sex'
	}
};

/** `scales.color.scheme` maps series names to specific colors, overriding the default palette. */
export const CustomScheme: Story = {
	args: {
		color: 'sex',
		scales: {
			color: {
				scheme: {
					female: '#ec4899',
					male: '#3b82f6'
				}
			}
		}
	}
};
