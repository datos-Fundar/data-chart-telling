import type { Meta, StoryObj } from '@storybook/svelte-vite';
import Plot from '$lib/plots/generic/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `rect` marker (svelteplot's own `Rect`) - an arbitrary rectangle from
// literal `x1`/`x2`/`y1`/`y2` bounds, unlike `bar` (which is built for one
// mark per data row on a categorical axis). `data: [{}]` is a one-row
// placeholder - nothing in it is actually read when every bound is a literal
// number. Demoed on a `Plot` of no data so only the marker itself is
// on screen - see `Channels/X1X2Y1Y2` for `x1`/`x2`/`y1`/`y2` on real data.

const meta = {
	title: 'Markers/Rect',
	component: Plot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'Plot' } }
	}
} satisfies Meta<typeof Plot>;

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

const BOXES = [
	{ name: 'Wholesale and retail trade', value: 15365, x1: 0.2, x2: 5.2, y1: 3.2, y2: 9.8 },
	{ name: 'Banking and finance', value: 7857, x1: 5.4, x2: 7.6, y1: 6.2, y2: 9.8 },
	{ name: 'Public administration', value: 7606, x1: 7.8, x2: 9.8, y1: 6.2, y2: 9.8 },
	{ name: 'Chemicals', value: 2999, x1: 5.4, x2: 6.8, y1: 3.2, y2: 6.0 },
	{ name: 'Publishing and printing', value: 1251, x1: 7.0, x2: 8.0, y1: 3.2, y2: 6.0 },
	{ name: 'Machinery and equipment', value: 973, x1: 8.2, x2: 8.6, y1: 3.2, y2: 6.0 },
	{ name: 'Clothing', value: 814, x1: 8.8, x2: 9.2, y1: 3.2, y2: 6.0 },
	{ name: 'Textiles', value: 381, x1: 0.2, x2: 1.0, y1: 0.2, y2: 3.0 },
	{ name: 'Oil, gas and coal', value: 778, x1: 1.2, x2: 5.2, y1: 0.2, y2: 3.0 }
];

/**
 * `label` writes a text in each rectangle: it takes every option of a `text` marker, but where it goes - the middle
 * of its rectangle. It is fitted to the rectangle unless `fit: false`: written smaller, down to `minFontSize`, when it
 * does not fit; broken into lines and cut short with an ellipsis at that size; as its `fallback` - here the value
 * alone - when almost none of it would show; and not at all when not even that fits.
 */
export const Label: Story = {
	args: {
		scales: {
			x: { domain: [0, 10], axisDisplay: 'none' },
			y: { domain: [0, 10], axisDisplay: 'none' }
		},
		markers: [
			{
				type: 'rect',
				data: BOXES,
				x1: 'x1',
				x2: 'x2',
				y1: 'y1',
				y2: 'y2',
				styles: { fill: 'steelblue', fillOpacity: 0.85 },
				label: {
					text: 'name',
					styles: { fontSize: 14, fill: 'white' },
					fit: { fallback: 'value' }
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * `anchor` puts the label against an edge (`'top'`, `'bottom'`, `'left'`, `'right'`) or in a corner (`'top-left'`...)
 * instead of the middle, and `outside` puts one anchored to an edge beyond it. `gap` is its distance from the edge.
 * A label outside is not fitted, and `fitMargins` makes room for it where it would run past the plot.
 */
export const LabelAnchor: Story = {
	args: {
		scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
		markers: [
			{
				type: 'rect',
				data: [{ x1: 1, x2: 4, y1: 2, y2: 8 }],
				x1: 'x1',
				x2: 'x2',
				y1: 'y1',
				y2: 'y2',
				styles: { fill: 'steelblue', fillOpacity: 0.85 },
				label: { text: 'top-left', anchor: 'top-left', styles: { fill: 'white' } }
			},
			{
				type: 'rect',
				data: [{ x1: 5, x2: 8, y1: 2, y2: 8 }],
				x1: 'x1',
				x2: 'x2',
				y1: 'y1',
				y2: 'y2',
				styles: { fill: 'steelblue', fillOpacity: 0.85 },
				label: { text: 'outside, above', anchor: 'top', outside: true }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
