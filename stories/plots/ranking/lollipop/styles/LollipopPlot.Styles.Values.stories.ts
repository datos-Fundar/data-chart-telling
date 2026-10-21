import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { PROVINCE_VALUES } from '$examples/data';

const FEMALE = PROVINCE_VALUES.filter((row) => row.sex === 'female');

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.values` writes each lollipop's value just past its dot. A label
// flips to the other side where it would cross the plot's edge.

const meta = {
	title: 'Plots/Ranking/LollipopPlot/Styles/Values',
	component: LollipopPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { y: { domain: [70, 85] } },
		data: FEMALE,
		x: 'province',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LollipopPlot' } }
	}
} satisfies Meta<typeof LollipopPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `show: true` labels every dot with its value. */
export const Default: Story = {
	args: {
		styles: { values: { show: true } } satisfies AxisBasedStylesConfig
	}
};

/** `format` turns the number into text; sideways lollipops put the label to the right of the dot. */
export const SidewaysPercent: Story = {
	args: {
		x: 'value',
		y: 'province',
		scales: { x: { domain: [70, 85] } },
		styles: {
			values: { show: true, format: (value: number) => `${value} years` }
		} satisfies AxisBasedStylesConfig
	}
};
