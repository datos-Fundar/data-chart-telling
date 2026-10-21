import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An `arrow` marker (svelteplot's own `Arrow`) - a point-to-point annotation,
// unlike `vector` (a point plus a length/rotation, geo-only). `x1`/`y1` →
// `x2`/`y2` already fully describe the direction, so there's no
// `isHorizontal` to pick between. Demoed on an empty `LinePlot` canvas so
// only the marker itself is on screen, same as `Markers/Rect`.

const meta = {
	title: 'Markers/Arrow',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'x',
		y: 'y',
		scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A straight arrow from one literal point to another. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'arrow',
				data: [{}],
				x1: 2,
				y1: 2,
				x2: 8,
				y2: 7,
				styles: { stroke: '#7c3aed', strokeWidth: 2 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `bend` curves the arrow into an arc instead of a straight line; `headLength`/`headAngle` reshape the arrowhead. */
export const Bent: Story = {
	args: {
		markers: [
			{
				type: 'arrow',
				data: [{}],
				x1: 1,
				y1: 8,
				x2: 9,
				y2: 8,
				bend: true,
				headLength: 12,
				headAngle: 40,
				styles: { stroke: '#dc2626', strokeWidth: 2 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
