import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/ranking/dumbbell/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { PROVINCE_VALUES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A marker's own `.statistics` summarizes that marker's own `data`, apart from the plot's:
// here a `dot` marker over just the female rows has its own deviation, in red, next to the
// plot's pooled one.

const meta = {
	title: 'Layout/Statistics/Deviation/Marker Level',
	component: DumbbellPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_VALUES,
		x: 'value',
		y: 'province',
		color: 'sex'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		data: { control: false },
		statistics: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The plot's own deviation is pooled and gray; the dot marker over the female rows derives its own, in red, from those rows alone. */
export const MarkerLevel: Story = {
	args: {
		statistics: [
			{
				type: 'deviation',
				pooled: true,
				rule: { stroke: '#6b7280' },
				band: { fill: '#6b7280' }
			}
		],
		markers: [
			{
				type: 'dot',
				data: PROVINCE_VALUES.filter((d) => d.sex === 'female'),
				x: 'value',
				y: 'province',
				r: 4,
				styles: { dotFill: '#073531', dotStroke: '#073531' },
				statistics: [
					{
						type: 'deviation',
						rule: { label: { text: 'Female mean' } },
						band: { fillOpacity: 0.08 }
					}
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
