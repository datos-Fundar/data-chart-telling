import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';

import { AGE_SHARES } from '$datasets';

const CENSUSES = AGE_SHARES.filter(({ year }) => year === 1991 || year === 2022);

// ── Meta ──────────────────────────────────────────────────────────────────────
// A slope plot draws a line and a dot per series between the positions of its category
// axis - here each age group's share of Buenos Aires City's population in two censuses -
// and labels both ends. The positions keep the order the data gives them, even when they
// are numbers.

const meta = {
	title: 'Plots/Evolution/SlopePlot/Series',
	component: SlopePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: CENSUSES,
		x: 'year',
		y: 'share',
		color: 'ageGroup',
		styles: { values: { show: true } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } }
	},
	parameters: {
		docs: { source: { name: 'SlopePlot' } }
	}
} satisfies Meta<typeof SlopePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Two censuses, each group labelled at both ends. */
export const Default: Story = {};

/** More than two positions work too: each series is one line through them. */
export const FourCensuses: Story = {
	args: { data: AGE_SHARES }
};

/** Without values, only the lines and dots remain. */
export const WithoutLabels: Story = {
	args: { styles: {} }
};
