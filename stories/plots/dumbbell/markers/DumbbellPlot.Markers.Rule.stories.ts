import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/dumbbell/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { PROVINCE_VALUES } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A DumbbellPlot's own connectors and dots are its marks. A `rule` marker adds a
// reference line across them, drawn on top.

const meta = {
	title: 'Plots/DumbbellPlot/Markers/Rule',
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
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A dashed rule at 77: the dots on either side of it. */
export const Reference: Story = {
	args: {
		markers: [
			{
				type: 'rule',
				axis: 'y',
				value: 77,
				styles: { strokeDasharray: '4 4', strokeOpacity: 0.7 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
