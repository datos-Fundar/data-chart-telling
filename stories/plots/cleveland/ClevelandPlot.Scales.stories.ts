import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClevelandPlot from '$lib/plots/cleveland/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { ConnectorBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_SHARES } from '$examples/data';
import { SEQUENTIAL_COLORS } from './colors';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The value axis fits the values, without reaching for zero; the category axis
// lists the categories in the order the data gives them.

const meta = {
	title: 'Plots/ClevelandPlot/Scales',
	component: ClevelandPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: AGE_SHARES,
		x: 'ageGroup',
		y: 'share',
		grouping: 'year'
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
		docs: { source: { name: 'ClevelandPlot' } }
	}
} satisfies Meta<typeof ClevelandPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Axis labels replace the field names. */
export const Labels: Story = {
	args: {
		scales: {
			color: SEQUENTIAL_COLORS,
			x: { label: false },
			y: { label: 'Share of the population (%)' }
		} satisfies AxisBasedScalesConfig
	}
};

/** A `domain` on the category axis orders the rows. */
export const CategoryOrder: Story = {
	args: {
		scales: {
			color: SEQUENTIAL_COLORS,
			x: { domain: ['65+', '45-64', '30-44', '15-29', '0-14'] }
		} satisfies AxisBasedScalesConfig
	}
};

/** A pinned `y` domain from zero shows each gap against the full axis. */
export const FromZero: Story = {
	args: {
		scales: {
			color: SEQUENTIAL_COLORS,
			y: { domain: [0, 30] }
		} satisfies AxisBasedScalesConfig
	}
};

/** `paddingOuter` sets the room before the first and after the last category. */
export const EdgeRoom: Story = {
	args: {
		scales: {
			color: SEQUENTIAL_COLORS,
			x: { paddingOuter: 1 }
		} satisfies AxisBasedScalesConfig
	}
};

/** `sort: { by: 'range' }` orders the age groups by how much their share varied across the four censuses, the widest first - the connector, drawn whole from the lowest to the highest dot, is labelled with that spread. */
export const SortedByRange: Story = {
	args: {
		scales: {
			color: SEQUENTIAL_COLORS,
			x: { sort: { by: 'range', order: 'descending' } }
		} satisfies AxisBasedScalesConfig,
		styles: {
			// From the lowest dot to the highest: the connector is whole, and so is its label's span.
			connector: {
				from: 'min',
				to: 'max',
				label: { text: 'length', format: (value: number) => `${value.toFixed(1)} pts` }
			}
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `sort: { by: 'value', series: '2022' }` orders them by the share in one census: the largest age group of 2022 first - the labels write the 2022 share. */
export const SortedByLastCensus: Story = {
	args: {
		scales: {
			color: SEQUENTIAL_COLORS,
			x: { sort: { by: 'value', series: '2022', order: 'descending' } }
		} satisfies AxisBasedScalesConfig,
		styles: {
			connector: { from: 'min', to: 'max' },
			values: {
				show: true,
				select: 'last',
				format: (value: number) => `${value}%`
			}
		} satisfies ConnectorBasedStylesConfig
	}
};
