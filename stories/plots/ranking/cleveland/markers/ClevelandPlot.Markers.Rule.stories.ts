import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClevelandPlot from '$lib/plots/ranking/cleveland/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { AGE_SHARES } from '$datasets';
import { SEQUENTIAL_COLORS } from '../colors';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A ClevelandPlot's own connectors and dots are its marks. A `rule` marker adds a
// reference line across them, drawn on top.

const meta = {
	title: 'Plots/Ranking/ClevelandPlot/Markers/Rule',
	component: ClevelandPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { color: SEQUENTIAL_COLORS },
		data: AGE_SHARES,
		x: 'ageGroup',
		y: 'share',
		grouping: 'year'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ClevelandPlot' } }
	}
} satisfies Meta<typeof ClevelandPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A dashed rule at 20: the dots on either side of it. */
export const Reference: Story = {
	args: {
		markers: [
			{
				type: 'rule',
				axis: 'y',
				value: 20,
				styles: { strokeDasharray: '4 4', strokeOpacity: 0.7 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
