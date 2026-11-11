import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ViolinPlot from '$lib/plots/distribution/violin/Plot.svelte';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The box inside each violin has the same parts as a box plot's, which `styles.values.parts` picks: its median by
// default, beside the violin. Iris sepal lengths, by species (Fisher, 1936).

const meta = {
	title: 'Plots/Distribution/ViolinPlot/Styles/Values',
	component: ViolinPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: IRIS,
		x: 'species',
		y: 'sepalLength',
		color: 'species',
		styles: { area: { fillOpacity: 0.4 } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 100, max: 700, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ViolinPlot' } }
	}
} satisfies Meta<typeof ViolinPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `show: true` writes each violin's median. */
export const Default: Story = {
	args: { styles: { area: { fillOpacity: 0.4 }, values: { show: true } } }
};

/** The quartiles too: where the middle half of each species' sepals fall. */
export const Quartiles: Story = {
	args: {
		styles: { area: { fillOpacity: 0.4 }, values: { parts: ['p25', 'median', 'p75'], decimals: 1 } }
	}
};
