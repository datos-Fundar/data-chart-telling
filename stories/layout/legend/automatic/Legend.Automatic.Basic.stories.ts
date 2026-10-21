import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import ComposerDemo from './ComposerDemo.svelte';
import ComposerDemoSource from './ComposerDemo.svelte?raw';
import { demoSource } from '../../../common/docsSource';
import { FEMALE_LIFE_EXPECTANCY } from '../../../plots/evolution/line/data';
import { AUTOMATIC_ARGS, LEGEND_ARG_TYPES } from './common';

/**
 * Every plot shows a legend by default, read off what it draws: as each plot
 * resolves, it registers what it draws - its series (name, color and how it
 * draws them) and the scales its channels encode - on its figure's
 * `LegendState`, and the figure shows them. A plot with a single series
 * shows no series section.
 *
 * `legend` decides what the figure shows:
 * - unset or `true`: the automatic legend;
 * - `false`: no legend;
 * - a list of sections: exactly those (see `Replace`);
 * - `{ items, sections }`: the automatic legend with those added (see `Add`);
 * - `{ series, color, opacity, r, symbol }`: the automatic legend with the
 *   section each channel draws adjusted (see `Expand`).
 *
 * The other stories in this folder: `Types` shows what the legend reads for
 * each kind of plot and channel, `Add`, `Replace` and `Expand` the three ways
 * to go beyond it.
 */
const meta = {
	title: 'Layout/Legend/Automatic/Basic',
	component: LinePlot,
	tags: ['autodocs'],
	args: AUTOMATIC_ARGS,
	argTypes: LEGEND_ARG_TYPES,
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No `legend` at all: the plot shows one series per sex, each in its own color and drawn as a line. */
export const ByDefault: Story = {};

/** A single series has nothing to tell apart, so the automatic legend stays out of the way. */
export const SingleSeries: Story = {
	args: {
		data: undefined,
		color: undefined,
		series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }]
	}
};

/**
 * `legend: true` is the same automatic legend. Pass it to place the legend in
 * a chrome `order` of your own - here, under the plot.
 */
export const PlacedWithOrder: Story = {
	args: {
		title: 'Life expectancy at birth',
		legend: true,
		order: ['title', 'plot', 'legend']
	}
};

/** `legend: false` hides it. */
export const Hidden: Story = {
	args: { legend: false }
};

/**
 * In a `PlotComposer`, the panels leave their legend to the composer: it
 * shows every series its plots draw, once - and a scale two plots draw the
 * same way, once too. A panel that sets `legend` shows its own instead.
 */
export const InAComposer: StoryObj = {
	render: () => ({ Component: ComposerDemo }),
	parameters: demoSource(ComposerDemoSource)
};
