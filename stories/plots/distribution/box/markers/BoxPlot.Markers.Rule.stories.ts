import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A BoxPlot's own boxes are its marks. A `rule` marker adds a reference line
// across them, drawn on top.

const meta = {
	title: 'Plots/Distribution/BoxPlot/Markers/Rule',
	component: BoxPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: IRIS,
		x: 'species',
		y: 'petalLength',
		color: 'species'
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

/** A dashed rule at 2.5 cm: the boxes that reach past it hold the flowers with longer petals. */
export const PetalThreshold: Story = {
	args: {
		markers: [
			{
				type: 'rule',
				axis: 'y',
				value: 2.5,
				styles: { strokeDasharray: '4 4', strokeOpacity: 0.7 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
