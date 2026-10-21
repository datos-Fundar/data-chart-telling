import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `bar` marker (`role: 'segment'`, svelteplot's own `BarX`/`BarY`) -
// author-facing `x`/`x1`/`x2`/`y1`/`y2`/`y` build one bar per row of its own
// `data`. `isHorizontal` swaps which pair is the category vs. the value, same
// convention `BarPlot` itself uses. Demoed on an empty `LinePlot` canvas
// with a categorical axis so the bars have real bands to sit in - see
// `Plots/*/Markers` for markers used alongside real chart data.

const CATEGORY_DOMAIN = ['A', 'B', 'C'];

const meta = {
	title: 'Markers/Bar',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'category',
		y: 'value',
		scales: { x: { domain: CATEGORY_DOMAIN }, y: { domain: [0, 10] } }
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

const BARS = [
	{ category: 'A', value: 6 },
	{ category: 'B', value: 9 },
	{ category: 'C', value: 4 }
];

/** `isHorizontal: false` (vertical bars) - `x` is the category, `y1`/`y2` the value range from a zero baseline. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'bar',
				role: 'segment',
				isHorizontal: false,
				data: BARS,
				x: 'category',
				y1: 0,
				y2: 'value'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `isHorizontal: true` - `y` is the category, `x1`/`x2` the value range. The plot's own `scales` swap axes to match. */
export const Horizontal: Story = {
	args: {
		scales: { x: { domain: [0, 10] }, y: { domain: CATEGORY_DOMAIN } },
		markers: [
			{
				type: 'bar',
				role: 'segment',
				isHorizontal: true,
				data: BARS,
				y: 'category',
				x1: 0,
				x2: 'value'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `insetLeft`/`insetRight` narrow the bar within its own band; `styles` (an `AreaStyle`) sets fill/opacity. */
export const CustomStyle: Story = {
	args: {
		markers: [
			{
				type: 'bar',
				role: 'segment',
				isHorizontal: false,
				data: BARS,
				x: 'category',
				y1: 0,
				y2: 'value',
				insetLeft: 0.2,
				insetRight: 0.2,
				styles: { fill: '#7c3aed', fillOpacity: 0.7 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
