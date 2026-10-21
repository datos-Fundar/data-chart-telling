import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../plots/correlation/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `brush` marker (svelteplot's own `Brush`) - an interactive drag-to-select
// rectangle drawn over the plot. The marker owns the live selection; `brush`
// only seeds the initial one, and `onbrushstart`/`onbrush`/`onbrushend` report
// every change (each event carries the current selection as `event.brush`).
// It does not dim or filter anything on its own - wire the callbacks to
// whatever should react to the selection.

const meta = {
	title: 'Markers/Brush',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Drag anywhere on the plot to draw a selection; drag inside it to move it, or its edges to resize it. */
export const Basic: Story = {
	args: {
		markers: [{ type: 'brush' }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `brush` seeds an initial selection, in data coordinates. */
export const InitialSelection: Story = {
	args: {
		markers: [
			{ type: 'brush', brush: { enabled: true, x1: 10, x2: 60, y1: 75, y2: 85 } }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `limitDimension: 'x'` makes a horizontal range selector that spans the full plot height. */
export const HorizontalRangeOnly: Story = {
	args: {
		markers: [
			{
				type: 'brush',
				limitDimension: 'x',
				constrainToDomain: true,
				styles: { stroke: '#4f46e5', strokeDasharray: '4,2', strokeOpacity: 1, strokeWidth: 1.5 },
				onbrush: (event) => console.log('brush', event.brush)
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
