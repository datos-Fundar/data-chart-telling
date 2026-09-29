import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A marker's own `.statistics` fits against that marker's own `data`,
// independent of the plot's top-level `statistics` (unset here). Useful to
// annotate one hand-picked subset without touching `color`/`grouping` at all.

const AMERICAS = COUNTRIES.filter((d) => d.region === 'Americas');

const meta = {
	title: 'Layout/Statistics/Regression/Marker Level',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		r: 6
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

/** A hand-authored `dot` marker highlights just the Americas subset and derives its own regression from that same `data` — the rest of the dataset renders plainly, with no top-level `statistics` at all. */
export const MarkerLevel: Story = {
	args: {
		markers: [
			{
				type: 'dot',
				data: AMERICAS,
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				r: 8,
				styles: { dotFill: '#7c3aed', dotStroke: '#7c3aed' },
				statistics: [{ type: 'regression', confidence: false, styles: { stroke: '#7c3aed' } }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
