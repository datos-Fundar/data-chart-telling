import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { PENGUIN_COUNTS_BY_SEX } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The hover a SankeyPlot has of its own: what `markers={[{ type: 'hover' }]}` draws. Every feature of the hover -
// its strategies, labels, scope, `active` and `others`, `related`, `back` and `front` - is in `Layout/Hover`.

const meta = {
	title: 'Plots/Flow/SankeyPlot/Markers/Hover',
	component: SankeyPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: PENGUIN_COUNTS_BY_SEX,
		columns: ['species', 'island', 'sex'],
		value: 'count'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		columns: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'SankeyPlot' } }
	}
} satisfies Meta<typeof SankeyPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: a hovered link stands out, and a hovered node lights up every link it is
 * an end of; the rest stay as they are. The tooltip names the node or the link and the penguins through it.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `others` fades every link the hover does not reach, so the hovered ones read on their own. */
export const OthersFaded: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover', others: { fillOpacity: 0.1 } }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `active` restyles the links the hover reaches: here outlined, in their own color at full strength. */
export const ActiveOutlined: Story = {
	args: {
		tooltip: true,
		markers: [
			{ type: 'hover', active: { fillOpacity: 0.9, stroke: '#111827', strokeWidth: 1 } }
		] satisfies AxisBasedMarkersConfig[]
	}
};
