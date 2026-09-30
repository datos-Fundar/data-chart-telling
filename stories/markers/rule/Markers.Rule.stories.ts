import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `rule` marker (svelteplot's own `RuleX`/`RuleY`) — a vertical/horizontal
// reference line at `value`, or one per row with `data`. Demoed on an empty
// `LinePlot` canvas so only the marker itself is on screen — see
// `Plots/*/Markers/Rules` for markers used alongside real chart data.

const meta = {
	title: 'Markers/Rule',
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

/** `axis: 'x'`, a literal `value` — one vertical line, spanning the full plot by default. */
export const Basic: Story = {
	args: {
		markers: [{ type: 'rule', axis: 'x', value: 6 }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `data` + a field-key `value` — one horizontal line per row, from a single marker. */
export const MultipleFromData: Story = {
	args: {
		markers: [
			{
				type: 'rule',
				axis: 'y',
				data: [{ v: 3 }, { v: 7 }],
				value: 'v',
				styles: { stroke: '#0891b2' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `y1`/`y2` bound the line's own extent instead of spanning the full plot; `styles` sets color/dash pattern. */
export const Bounded: Story = {
	args: {
		markers: [
			{
				type: 'rule',
				axis: 'x',
				value: 6,
				y1: 2,
				y2: 8,
				styles: { stroke: '#7c3aed', strokeWidth: 2, strokeDasharray: '6 3' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
