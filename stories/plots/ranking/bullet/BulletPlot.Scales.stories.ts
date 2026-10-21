import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import { PROVINCE_LIFE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The value axis starts at zero and reaches the bars, the targets and the largest range;
// pin its `domain` to start elsewhere: the bars and the bands start at the nearest end.

const meta = {
	title: 'Plots/Ranking/BulletPlot/Scales',
	component: BulletPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_LIFE,
		x: 'female',
		y: 'province',
		target: 80,
		ranges: [76, 80, 85],
		scales: { x: { domain: [70, 85] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		scales: { description: 'Per-axis scale configuration.', control: false }
	},
	parameters: {
		docs: { source: { name: 'BulletPlot' } }
	}
} satisfies Meta<typeof BulletPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Axis labels replace the field names. */
export const Labels: Story = {
	args: {
		scales: { x: { domain: [70, 85], label: 'Life expectancy (years)' }, y: { label: false } }
	}
};

/** `sort` orders the categories by their value, the highest first. */
export const SortedByValue: Story = {
	args: {
		scales: { x: { domain: [70, 85] }, y: { sort: { by: 'value', order: 'descending' } } }
	}
};

/** With no domain pinned, the axis starts at zero and the bands fill it from there. */
export const FromZero: Story = {
	args: {
		scales: {}
	}
};
