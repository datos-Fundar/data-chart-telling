import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BoxPlot from '$lib/plots/box/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { BUENOS_AIRES_TRIPS } from '../../../data/commute-times';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A BoxPlot's own boxes are its marks. A `rule` marker adds a reference line
// across them, drawn on top.

const meta = {
	title: 'Plots/BoxPlot/Markers/Rule',
	component: BoxPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: BUENOS_AIRES_TRIPS,
		x: 'mode',
		y: 'minutes',
		color: 'mode'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'BoxPlot' } }
	}
} satisfies Meta<typeof BoxPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A dashed rule at an hour: the boxes that reach past it hold the trips longer than that. */
export const OneHourTarget: Story = {
	args: {
		markers: [
			{
				type: 'rule',
				axis: 'y',
				value: 60,
				styles: { strokeDasharray: '4 4', strokeOpacity: 0.7 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
