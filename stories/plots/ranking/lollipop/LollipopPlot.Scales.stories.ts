import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { PROVINCE_VALUES } from '$examples/data';

const FEMALE = PROVINCE_VALUES.filter((row) => row.sex === 'female');

// ── Meta ──────────────────────────────────────────────────────────────────────
// The value axis reaches zero, where the stems start; pinning its `domain`
// moves the baseline to the nearest end of it. The category axis lists the
// categories in the order the data gives them.

const meta = {
	title: 'Plots/Ranking/LollipopPlot/Scales',
	component: LollipopPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: FEMALE,
		x: 'province',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		scales: {
			description: 'Per-axis scale configuration.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'LollipopPlot' } }
	}
} satisfies Meta<typeof LollipopPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Axis labels replace the field names. */
export const Labels: Story = {
	args: {
		scales: {
			x: { label: 'Province' },
			y: { label: 'Life expectancy at birth (years)' }
		} satisfies AxisBasedScalesConfig
	}
};

/** A `domain` on the category axis orders the lollipops: here from the highest value to the lowest. */
export const CategoryOrder: Story = {
	args: {
		scales: {
			x: {
				domain: ['Chubut', 'Mendoza', 'Córdoba', 'Buenos Aires', 'Salta']
			}
		} satisfies AxisBasedScalesConfig
	}
};

/** A pinned `y` domain moves the baseline: the stems start at its low end, so they compare the gap above 70 years. */
export const RaisedBaseline: Story = {
	args: {
		scales: {
			y: { domain: [70, 85] }
		} satisfies AxisBasedScalesConfig
	}
};

/** `paddingOuter` sets the room before the first and after the last lollipop. */
export const EdgeRoom: Story = {
	args: {
		scales: {
			x: { paddingOuter: 1 }
		} satisfies AxisBasedScalesConfig
	}
};
