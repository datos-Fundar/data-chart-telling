import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
import type { LegendSection } from '$lib/types/layout/legend';

/** A single continuous section: a gradient bar with min/max labels and ticks. */
const meta = {
	title: 'Layout/Legend/Continuous',
	component: LegendLayout,
	tags: ['autodocs'],
	parameters: {
		docs: { source: { name: 'LegendLayout' } }
	}
} satisfies Meta<typeof LegendLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One continuous section: a gradient bar with min/max labels and ticks. */
export const SingleContinuous: Story = {
	args: {
		sections: [
			{
				type: 'continuous',
				title: 'Percentage',
				min: 0,
				max: 0.2,
				colorMin: '#e0e7ff',
				colorMax: '#4f46e5',
				ticks: [0.05, 0.1, 0.15],
				format: (v) => `${(v * 100).toFixed(0)}%`,
				width: 220
			}
		] satisfies LegendSection[]
	}
};

const pct = (v: number) => `${v.toFixed(0)}%`;

/**
 * The legend always writes the two ends of its domain, so a tick label that would touch one gives way to it.
 * Here the domain starts at 25% and the first tick sits at 30%: on a bar this narrow their labels would overlap,
 * so the 30% label (and its mark) is left out. Widen the bar and it comes back.
 */
export const TickNearTheMinimum: Story = {
	args: {
		sections: [
			{
				type: 'continuous',
				title: 'Tick 30% against the minimum, 25%',
				min: 25,
				max: 73,
				colorMin: '#e0e7ff',
				colorMax: '#4f46e5',
				ticks: [30, 40, 50, 60],
				format: pct,
				width: 170
			}
		] satisfies LegendSection[]
	}
};

/** The same at the other end: the 70% tick is too close to the maximum, 73%, and gives way to it. */
export const TickNearTheMaximum: Story = {
	args: {
		sections: [
			{
				type: 'continuous',
				title: 'Tick 70% against the maximum, 73%',
				min: 25,
				max: 73,
				colorMin: '#e0e7ff',
				colorMax: '#4f46e5',
				ticks: [40, 50, 60, 70],
				format: pct,
				width: 170
			}
		] satisfies LegendSection[]
	}
};

/**
 * Ticks that touch each other: they are weighed from the low end up and each one stays only if it clears the edge
 * labels and the ticks kept before it. Of 40, 45, 50, 55 and 60 on a bar this narrow, 40, 50 and 60 are written
 * and the ones between are not.
 */
export const TicksTouchingEachOther: Story = {
	args: {
		sections: [
			{
				type: 'continuous',
				title: 'Five ticks on a narrow bar',
				min: 0,
				max: 100,
				colorMin: '#e0e7ff',
				colorMax: '#4f46e5',
				ticks: [40, 45, 50, 55, 60],
				format: pct,
				width: 150
			}
		] satisfies LegendSection[]
	}
};

/** Every collision at once: a tick against each end and ticks against each other. The edge labels always win. */
export const EveryCollision: Story = {
	args: {
		sections: [
			{
				type: 'continuous',
				title: 'Ticks against both ends and each other',
				min: 25,
				max: 73,
				colorMin: '#e0e7ff',
				colorMax: '#4f46e5',
				ticks: [30, 33, 36, 50, 66, 69, 72],
				format: pct,
				width: 170
			}
		] satisfies LegendSection[]
	}
};

/**
 * The cure: with room for every label nothing is left out. Same domain and ticks as `TickNearTheMinimum` and
 * `TickNearTheMaximum`, on a wider bar.
 */
export const RoomForEveryLabel: Story = {
	args: {
		sections: [
			{
				type: 'continuous',
				title: 'The same ticks on a wide bar',
				min: 25,
				max: 73,
				colorMin: '#e0e7ff',
				colorMax: '#4f46e5',
				ticks: [30, 40, 50, 60, 70],
				format: pct,
				width: 400
			}
		] satisfies LegendSection[]
	}
};

/** `legend.continuous.label.overlap.margin` sets the slack the labels need between them; `enabled: false` writes them all, touching or not. */
export const SeveralWidths: Story = {
	args: {
		sections: [120, 200, 320].map(
			(width): LegendSection => ({
				type: 'continuous',
				title: `${width}px`,
				min: 25,
				max: 73,
				colorMin: '#e0e7ff',
				colorMax: '#4f46e5',
				ticks: [30, 40, 50, 60, 70],
				format: pct,
				width
			})
		)
	}
};
