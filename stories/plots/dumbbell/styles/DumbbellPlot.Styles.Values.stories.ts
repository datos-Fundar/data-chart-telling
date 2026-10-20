import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/dumbbell/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { PROVINCE_VALUES } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.values` writes each dot's value: past the highest and the lowest of its
// category, and beside the ones between.

const meta = {
	title: 'Plots/DumbbellPlot/Styles/Values',
	component: DumbbellPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `show: true` labels every dot with its value. */
export const Default: Story = {
	args: {
		styles: { values: { show: true } } satisfies AxisBasedStylesConfig
	}
};

/** `format` turns the number into text; sideways rows put the labels to the right of the highest dot. */
export const Sideways: Story = {
	args: {
		x: 'value',
		y: 'province',
		scales: { x: { domain: [70, 85] } },
		styles: {
			values: { show: true, format: (value: number) => `${value} years` }
		} satisfies AxisBasedStylesConfig
	}
};
