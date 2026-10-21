import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `rect` marker (svelteplot's own `Rect`) - an arbitrary rectangle from
// literal `x1`/`x2`/`y1`/`y2` bounds, unlike `bar` (which is built for one
// mark per data row on a categorical axis). `data: [{}]` is a one-row
// placeholder - nothing in it is actually read when every bound is a literal
// number. Demoed on an empty `LinePlot` canvas so only the marker itself is
// on screen - see `Channels/X1X2Y1Y2` for `x1`/`x2`/`y1`/`y2` on real data.

const meta = {
	title: 'Markers/Rect',
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

/** `x1`/`x2`/`y1`/`y2` as literal numbers - an arbitrary highlighted region, independent of any row data. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: [{}],
				x1: 2,
				x2: 6,
				y1: 3,
				y2: 8,
				styles: { fill: '#7c3aed', fillOpacity: 0.4 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `styles.fill: 'none'` plus a dashed stroke turns the rect into an outline-only callout box; `borderRadius` rounds its corners. */
export const CustomStyle: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: [{}],
				x1: 1,
				x2: 9,
				y1: 4,
				y2: 6,
				styles: {
					fill: 'none',
					stroke: '#dc2626',
					strokeWidth: 2,
					strokeDasharray: '6 3',
					borderRadius: 8
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
