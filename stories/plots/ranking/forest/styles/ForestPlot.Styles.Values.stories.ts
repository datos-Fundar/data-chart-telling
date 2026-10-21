import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import type { ConnectorBasedStylesConfig } from '$lib/types/layout/styles';
import { INFLATION_RANGES } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.values` writes each estimate beside its dot. `format` also gets the row, so a
// label can write the interval too, and `fontStyle` styles the text.

const meta = {
	title: 'Plots/Ranking/ForestPlot/Styles/Values',
	component: ForestPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 480
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ForestPlot' } }
	}
} satisfies Meta<typeof ForestPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const MEANS = {
	data: INFLATION_RANGES,
	x: 'mean',
	y: 'period',
	lower: 'min',
	upper: 'max',
	color: 'region'
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** `show: true` labels every estimate. */
export const Default: Story = {
	args: {
		...MEANS,
		styles: { values: { show: true } } satisfies ConnectorBasedStylesConfig
	}
};

/** `format` turns the number into text. */
export const Formatted: Story = {
	args: {
		...MEANS,
		styles: {
			values: { show: true, format: (value: number) => `${value}%`, fontStyle: { fontWeight: 600 } }
		} satisfies ConnectorBasedStylesConfig
	}
};

/** The categories on `x` stand the plot upright. */
export const Upright: Story = {
	args: {
		...MEANS,
		x: 'period',
		y: 'mean',
		styles: { values: { show: true } } satisfies ConnectorBasedStylesConfig
	}
};
