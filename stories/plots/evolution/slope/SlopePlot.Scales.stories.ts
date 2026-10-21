import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';

import { AGE_SHARES } from '$examples/data';

const CENSUSES = AGE_SHARES.filter(({ year }) => year === 1991 || year === 2022);

// ── Meta ──────────────────────────────────────────────────────────────────────
// The value axis is hidden by default, since the labels give the values; `axisDisplay`
// brings it back. The positions' order is the data's, unless `domain` sets it.

const meta = {
	title: 'Plots/Evolution/SlopePlot/Scales',
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
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		scales: { description: 'Per-axis scale configuration.', control: false }
	},
	parameters: {
		docs: { source: { name: 'SlopePlot' } }
	}
} satisfies Meta<typeof SlopePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The value axis back, over a domain pinned from zero. */
export const ValueAxis: Story = {
	args: { scales: { y: { axisDisplay: 'visible', domain: [0, 25] } } }
};

/** `domain` on the category axis sets the order of the positions: here the latest first. */
export const ReversedPositions: Story = {
	args: { scales: { x: { domain: [2022, 1991] } } }
};

/** Axis labels replace the field names. */
export const Labels: Story = {
	args: { scales: { x: { label: 'Census' }, y: { label: 'Share of the population (%)' } } }
};
