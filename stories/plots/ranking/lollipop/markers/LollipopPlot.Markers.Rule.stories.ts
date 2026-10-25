import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { PROVINCE_VALUES } from '$datasets';

const FEMALE = PROVINCE_VALUES.filter((row) => row.sex === 'female');

// ── Meta ──────────────────────────────────────────────────────────────────────
// A LollipopPlot's own stems and dots are its marks. A `rule` marker adds a
// reference line across them, drawn on top.

const meta = {
	title: 'Plots/Ranking/LollipopPlot/Markers/Rule',
	component: LollipopPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { y: { domain: [70, 85] } },
		data: FEMALE,
		x: 'province',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LollipopPlot' } }
	}
} satisfies Meta<typeof LollipopPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A dashed rule at a target: the lollipops that stop short of it are the provinces below an 80-year life expectancy. */
export const Target: Story = {
	args: {
		markers: [
			{
				type: 'rule',
				axis: 'y',
				value: 80,
				styles: { strokeDasharray: '4 4', strokeOpacity: 0.7 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
