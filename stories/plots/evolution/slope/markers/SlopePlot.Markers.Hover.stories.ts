import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { AGE_SHARES } from '$examples/data';

const CENSUSES = AGE_SHARES.filter(({ year }) => year === 1991 || year === 2022);

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `hover` marker answers the pointer inside the plot: with only two positions, it
// snaps to whichever one is nearest and marks that position's value of every series.

const meta = {
	title: 'Plots/Evolution/SlopePlot/Markers/Hover',
	component: SlopePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: CENSUSES,
		x: 'year',
		y: 'share',
		color: 'ageGroup'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		markers: { description: 'Marker annotations.', control: false }
	},
	parameters: {
		docs: { source: { name: 'SlopePlot' } }
	}
} satisfies Meta<typeof SlopePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The default hover marker: a dot and value label at the nearest position, with a dashed rule. */
export const Basic: Story = {
	args: {
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `showLabels: false` leaves the dots and the rule. */
export const WithoutLabels: Story = {
	args: {
		markers: [{ type: 'hover', showLabels: false }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `ruleX: false` hides the rule, leaving the dots and their labels. */
export const WithoutRule: Story = {
	args: {
		markers: [{ type: 'hover', ruleX: false }] satisfies AxisBasedMarkersConfig[]
	}
};

/** Next to the value labels at both ends, the hover marker marks the position under the pointer. */
export const WithValues: Story = {
	args: {
		styles: { values: { show: true } },
		markers: [{ type: 'hover', showLabels: false }] satisfies AxisBasedMarkersConfig[]
	}
};
