import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import { LIFE_EXPECTANCY } from '../../../plots/line/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The `color` channel: a plot-level `color` accessor plus `scales.color`
// drives every default mark's stroke - here, LinePlot's own line segments. This
// is the discrete categorical case: `color` groups series by name (sex), and
// `scales.color` maps those category names to specific colors.

const meta = {
	title: 'Channels/Color/Plot Level/Line',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: LIFE_EXPECTANCY,
		x: 'year',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `color: 'sex'` groups the data by sex (male/female) and feeds each series
 * name into the plot's own `scales.color` ramp - the default palette cycles
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
					male: '#06b6d4',
					female: '#f43f5e'
				}
			}
		}
	}
};
