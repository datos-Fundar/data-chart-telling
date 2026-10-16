import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../../data/population-pyramid';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The `color` channel: a plot-level `color` accessor plus `scales.color`
// drives every default mark's fill - here, PyramidPlot's own bars. This is the
// discrete categorical case: `color` groups series by name, and `scales.color`
// maps those category names to specific colors via a `scheme` record.

const meta = {
	title: 'Channels/Color/Plot Level/Pyramid',
	component: PyramidPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 520,
		data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
		x: 'pct',
		y: 'ageGroup'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'PyramidPlot' } }
	}
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `color: 'sex'` groups the data by sex (female/male) and feeds each series
 * name into the plot's own `scales.color` ramp - the default palette cycles
 * through colors automatically for each series.
 */
export const Default: Story = {
	args: {
		color: 'sex',
		scales: { y: { domain: AGE_GROUPS } }
	}
};

/** `scales.color.scheme` maps series names to specific colors, overriding the default palette. */
export const CustomScheme: Story = {
	args: {
		color: 'sex',
		scales: {
			y: { domain: AGE_GROUPS },
			color: {
				scheme: {
					Female: '#ec4899',
					Male: '#3b82f6'
				}
			}
		}
	}
};
