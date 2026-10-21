import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { HEIGHT_DENSITY } from '../../../../data/height-density';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An AreaPlot's own default areas are the fill. A `line` marker adds a stroke
// along the area's top edge, drawn over it.

const meta = {
	title: 'Plots/Evolution/AreaPlot/Markers/Line',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHT_DENSITY,
		x: 'height',
		y: 'density',
		color: 'sex'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A dark line along each sex's top edge, on top of its filled area. */
export const EdgeLine: Story = {
	args: {
		markers: [
			{
				type: 'line',
				styles: { stroke: '#111827', strokeWidth: 1.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
