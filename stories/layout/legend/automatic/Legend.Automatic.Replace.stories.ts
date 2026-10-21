import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { LegendSection } from '$lib/types/layout/legend';
import { AUTOMATIC_ARGS, LEGEND_ARG_TYPES } from './common';

/**
 * Replacing the automatic legend: a list of sections shows exactly those,
 * and nothing the plots read.
 */
const meta = {
	title: 'Layout/Legend/Automatic/Replace',
	component: LinePlot,
	tags: ['autodocs'],
	args: AUTOMATIC_ARGS,
	argTypes: LEGEND_ARG_TYPES,
	parameters: { docs: { source: { name: 'LinePlot' } } }
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A list of sections replaces the automatic legend - here, a clickable one
 * that toggles each series off. Its items name the plot's series, so toggling
 * one dims it on the plot, and each takes its series' color.
 *
 * An item takes the color of whatever it names - a series, or a segment or
 * marker that names itself - unless it sets its own `color`. An item that
 * names nothing the plot draws gets the palette's colors in item order, which
 * need not match the series': set its `color`, or list items in the same order
 * the plot colors its series.
 */
export const CustomSections: Story = {
	args: {
		legend: [
			{
				type: 'discrete',
				title: 'Sex (click to dim)',
				items: [
					{ name: 'female', label: 'Female', symbol: 'line' },
					{ name: 'male', label: 'Male', symbol: 'line' }
				],
				interactive: { enabled: true }
			}
		] satisfies LegendSection[]
	}
};
