import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import LineMarkDemo from './LineMarkDemo.svelte';
import LineMarkDemoSource from './LineMarkDemo.svelte?raw';
import DotMarkDemo from './DotMarkDemo.svelte';
import DotMarkDemoSource from './DotMarkDemo.svelte?raw';
import BarMarkDemo from './BarMarkDemo.svelte';
import BarMarkDemoSource from './BarMarkDemo.svelte?raw';
import DotSizeDemo from './DotSizeDemo.svelte';
import DotSizeDemoSource from './DotSizeDemo.svelte?raw';
import DotSymbolDemo from './DotSymbolDemo.svelte';
import DotSymbolDemoSource from './DotSymbolDemo.svelte?raw';
import ContinuousColorDemo from './ContinuousColorDemo.svelte';
import ContinuousColorDemoSource from './ContinuousColorDemo.svelte?raw';
import MarkerChannelsDemo from './MarkerChannelsDemo.svelte';
import MarkerChannelsDemoSource from './MarkerChannelsDemo.svelte?raw';
import { demoSource } from '../../../common/docsSource';

/**
 * What the automatic legend reads, by plot and channel. A series shows as the
 * plot's own mark; every channel that encodes a value adds a section of its
 * own - a ramp for `color` and `opacity`, dots for `r`, shapes for `symbol` -
 * titled by its field, or by the name of the function that computes it.
 */
const meta = {
	title: 'Layout/Legend/Automatic/Types',
	component: LinePlot,
	tags: ['autodocs'],
	parameters: { docs: { source: { name: 'LinePlot' } } }
} satisfies Meta<typeof LinePlot>;

export default meta;

/** A line plot's series show on its legend as their stroke. */
export const LineMark: StoryObj = {
	render: () => ({ Component: LineMarkDemo }),
	parameters: demoSource(LineMarkDemoSource)
};

/** A bar plot's series show as a swatch. */
export const BarMark: StoryObj = {
	render: () => ({ Component: BarMarkDemo }),
	parameters: demoSource(BarMarkDemoSource)
};

/**
 * A scatter plot's series show as its dots: circles by default, or the shape
 * its dots share (`dotSymbol`), filled or as outlines as the dots draw.
 */
export const DotMark: StoryObj = {
	render: () => ({ Component: DotMarkDemo }),
	parameters: demoSource(DotMarkDemoSource)
};

/**
 * Dots that size by a value (`r`) add a size section: a few dots of the radius
 * each value draws at - in the dots' shape, filled or as rings as the plot
 * draws them, in the dots' color when they share one, else in the text color.
 */
export const DotSizeChannel: StoryObj = {
	render: () => ({ Component: DotSizeDemo }),
	parameters: demoSource(DotSizeDemoSource)
};

/**
 * Dots that take their shape from a category (`symbol`) add a symbol section:
 * each category next to the shape it draws as, by `scales.symbol` or the
 * theme's shape cycle. Its items name categories, not series, so they don't
 * toggle. Like the size section, it takes the dots' color when they share
 * one, and draws outlines when the dots are rings.
 */
export const DotSymbolChannel: StoryObj = {
	render: () => ({ Component: DotSymbolDemo }),
	parameters: demoSource(DotSymbolDemoSource)
};

/**
 * A numeric `color` channel adds a continuous section: the ramp the cells draw
 * with - a named `scheme`, or colors of your own - over the values' range, read
 * by the configured locale. A numeric `opacity` adds its own: one color fading
 * across the opacity range. A map's `color` is a function, so its legend takes
 * the function's name as its title: name it (`provincePopulation`, not an
 * inline arrow) to have it titled "Province population".
 */
export const ColorAndOpacityChannels: StoryObj = {
	render: () => ({ Component: ContinuousColorDemo }),
	parameters: demoSource(ContinuousColorDemoSource)
};

/**
 * The channels of a marker count as the plot's own. Here two markers color
 * their dots by different numbers, so the legend shows a ramp for each; a
 * marker coloring by a category lists each category in the color it draws it.
 * A marker that sizes (`r`) or shapes (`symbol`) its rows adds its section
 * whatever its type.
 */
export const MarkerChannels: StoryObj = {
	render: () => ({ Component: MarkerChannelsDemo }),
	parameters: demoSource(MarkerChannelsDemoSource)
};
