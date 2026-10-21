import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import EdgeTicksDemo from './EdgeTicksDemo.svelte';
import EdgeTicksDemoSource from './EdgeTicksDemo.svelte?raw';
import { demoSource } from '../../../common/docsSource';
import { FEMALE_LIFE_EXPECTANCY_SINCE_1947, type YearPoint } from '../../../plots/line/data';

/**
 * `axis.edgeTicks` sets, per axis and for every plot, whether a continuous
 * axis adds a tick at the data's first and last values beside its nice ones,
 * and what happens when one of them lands too close to a nice tick for both
 * labels. They are on for x and off for y by default:
 *
 * ```ts
 * import { setConfiguration } from '@fundar/data-chart-telling';
 *
 * setConfiguration({
 *   axis: {
 *     edgeTicks: {
 *       x: { enabled: true, collision: 'drop-nice' },
 *       y: { enabled: false, collision: 'drop-nice' }
 *     }
 *   }
 * });
 * ```
 *
 * - `'drop-nice'` (default) keeps the data's tick and drops the nice one.
 * - `'drop-edge'` keeps the nice tick and drops the data's.
 * - `'extend'` widens the axis to the next nice tick past the data.
 *
 * A plot overrides it with `scales.x.edgeTicks` or `scales.y.edgeTicks`:
 * `false` to turn them off, `true` to turn them on, or `{ collision }` to pick
 * its own strategy. The first story switches the global configuration; the
 * others set the prop on one plot and leave the configuration alone.
 */
const meta = {
	title: 'Configuration/Styling/Edge ticks',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 720,
		height: 360,
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_SINCE_1947
			} satisfies Series<YearPoint>
		]
	},
	parameters: {
		layout: 'padded',
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The global configuration, switched live: `axis.edgeTicks.x` turns the x
 * axis' edge ticks on or off and picks its collision strategy for every plot
 * on the page. On, with the default `'drop-nice'`, 1947 replaces the 1950 tick
 * it crowds. The configuration is global, so this story renders in a frame of
 * its own.
 */
export const Default: StoryObj = {
	render: () => ({ Component: EdgeTicksDemo }),
	parameters: {
		docs: {
			source: demoSource(EdgeTicksDemoSource).docs.source,
			story: { inline: false, height: '520px' }
		}
	}
};

/** `scales.x.edgeTicks: { collision: 'drop-edge' }` - the 1950 tick stays and 1947 goes. */
export const DropEdge: Story = {
	args: {
		scales: { x: { edgeTicks: { collision: 'drop-edge' } } } satisfies AxisBasedScalesConfig
	}
};

/** `scales.x.edgeTicks: { collision: 'extend' }` - the axis widens to 1940, the next nice tick past 1947. */
export const Extend: Story = {
	args: {
		scales: { x: { edgeTicks: { collision: 'extend' } } } satisfies AxisBasedScalesConfig
	}
};

/** `scales.x.edgeTicks: false` - only the nice ticks; the axis rounds out to 1940 and 2020. */
export const Off: Story = {
	args: { scales: { x: { edgeTicks: false } } satisfies AxisBasedScalesConfig }
};
