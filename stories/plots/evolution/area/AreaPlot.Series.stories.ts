import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { ENERGY_MIX } from '../../../data/energy-mix';
import {
	HEIGHT_DENSITY,
	MALE_HEIGHT_DENSITY,
	type HeightDensity
} from '../../../data/height-density';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Every series gets its own filled area from zero up to its curve. Grouping by
// `color` draws one area per group, and `transforms` (here `stackY`) stacks
// those areas on each other instead of letting them overlap.

const meta = {
	title: 'Plots/Evolution/AreaPlot/Series',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 500, step: 50 }
		},
		series: {
			description: 'Data series to render.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		},
		transforms: {
			description: 'svelteplot transforms run on every default area, e.g. `[{ type: stackY }]`.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** One series, one area: the male height density, filled from zero up to its curve. */
export const Default: Story = {
	args: {
		series: [
			{
				name: 'male',
				x: 'height',
				y: 'density',
				data: MALE_HEIGHT_DENSITY
			} satisfies Series<HeightDensity>
		]
	}
};

/** `color: 'sex'` splits the rows into one area per sex, each in its own color, overlapping from zero. */
export const Grouped: Story = {
	args: {
		data: HEIGHT_DENSITY,
		x: 'height',
		y: 'density',
		color: 'sex'
	}
};

/** Without a stacking transform, every area starts from zero on its own, so they overlap and each one reads against the axis. Compare with `Stacked`, where the top edge is the running total. */
export const NoStacked: Story = {
	args: {
		data: ENERGY_MIX,
		x: 'year',
		y: 'share',
		color: 'source',
		scales: { y: { domain: [0, 100], label: 'Share of energy mix (%)' } }
	}
};

/** `transforms: [{ type: 'stackY' }]` stacks the areas on each other, so the top edge is the total of all of them. Here, the parts of a whole: each year's energy mix sums to 100%. */
export const Stacked: Story = {
	args: {
		data: ENERGY_MIX,
		x: 'year',
		y: 'share',
		color: 'source',
		transforms: [{ type: 'stackY' }],
		scales: { y: { domain: [0, 100], label: 'Share of energy mix (%)' } }
	}
};
