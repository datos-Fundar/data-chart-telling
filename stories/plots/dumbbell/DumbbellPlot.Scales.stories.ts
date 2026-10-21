import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/dumbbell/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { ConnectorBasedStylesConfig } from '$lib/types/layout/styles';
import { PROVINCE_VALUES } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The value axis fits the values, without reaching for zero; the category axis
// lists the categories in the order the data gives them.

const meta = {
	title: 'Plots/DumbbellPlot/Scales',
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
		scales: {
			description: 'Per-axis scale configuration.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Axis labels replace the field names. */
export const Labels: Story = {
	args: {
		scales: {
			x: { label: false },
			y: { label: 'Life expectancy at birth (years)' }
		} satisfies AxisBasedScalesConfig
	}
};

/** A `domain` on the category axis orders the rows. */
export const CategoryOrder: Story = {
	args: {
		scales: {
			x: { domain: ['Chubut', 'Mendoza', 'Córdoba', 'Buenos Aires', 'Salta'] }
		} satisfies AxisBasedScalesConfig
	}
};

/** A pinned `y` domain from zero shows each gap against the full axis. */
export const FromZero: Story = {
	args: {
		scales: {
			y: { domain: [0, 90] }
		} satisfies AxisBasedScalesConfig
	}
};

/** `paddingOuter` sets the room before the first and after the last category. */
export const EdgeRoom: Story = {
	args: {
		scales: {
			x: { paddingOuter: 1 }
		} satisfies AxisBasedScalesConfig
	}
};

/** `sort: { by: 'range' }` orders the categories by the gap between their dots: here from the widest gap between the sexes to the narrowest, each connector labelled with its gap. */
export const SortedByGap: Story = {
	args: {
		scales: {
			x: { sort: { by: 'range', order: 'descending' } }
		} satisfies AxisBasedScalesConfig,
		styles: {
			connector: {
				label: { text: 'length', format: (value: number) => `${value.toFixed(1)} yr` }
			}
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `sort: { by: 'value', series }` orders them by one series' value: here by female life expectancy, the highest first - the labels write it. */
export const SortedByOneSeries: Story = {
	args: {
		scales: {
			x: { sort: { by: 'value', series: 'female', order: 'descending' } }
		} satisfies AxisBasedScalesConfig,
		styles: {
			values: { show: true, series: 'female' }
		} satisfies ConnectorBasedStylesConfig
	}
};
