import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import ExpandSeriesDemo from './ExpandSeriesDemo.svelte';
import ExpandSeriesDemoSource from './ExpandSeriesDemo.svelte?raw';
import ExpandColorDemo from './ExpandColorDemo.svelte';
import ExpandColorDemoSource from './ExpandColorDemo.svelte?raw';
import ExpandMatchDemo from './ExpandMatchDemo.svelte';
import ExpandMatchDemoSource from './ExpandMatchDemo.svelte?raw';
import ExpandSizeSymbolDemo from './ExpandSizeSymbolDemo.svelte';
import ExpandSizeSymbolDemoSource from './ExpandSizeSymbolDemo.svelte?raw';
import ExpandComposerDemo from './ExpandComposerDemo.svelte';
import ExpandComposerDemoSource from './ExpandComposerDemo.svelte?raw';
import { demoSource } from '../../../common/docsSource';

/**
 * Expanding the automatic legend: the plots still decide which sections it
 * has and what they show - their items, ramps and ranges - and `legend` adjusts
 * how each one is configured (its title, layout, width, format, whether it is
 * interactive...), without rewriting it as a list of sections.
 *
 * `legend` takes one key per channel, each the configuration of the section
 * that channel draws, minus what the plots compute for it:
 * - `series`: the discrete section of the plots' series;
 * - `color`: the continuous section of a numeric color ramp - the only one
 *   whose ramp can be `interactive` - and, as a categorical color is what makes
 *   the series, their discrete section too (`series` wins where both set the
 *   same option);
 * - `opacity`: the continuous section of an opacity ramp;
 * - `size` and `symbol`: the sections of a dot's `r` and `symbol` channels.
 *
 * When a channel draws several sections (two ramps from two markers, say), a
 * plain object adjusts all of them, and a list adjusts each entry's own: an
 * entry with a `match` adjusts the section with that title - the field name,
 * or the name of the function that computes the channel - and one without
 * adjusts the rest. The `items` and `sections` of `Add` combine with these.
 */
const meta = {
	title: 'Layout/Legend/Automatic/Expand',
	component: LinePlot,
	tags: ['autodocs'],
	parameters: { docs: { source: { name: 'LinePlot' } } }
} satisfies Meta<typeof LinePlot>;

export default meta;

/**
 * `series` adjusts the discrete section: here it makes the automatic legend
 * clickable, titles it and lays it out in a column. Compare `Replace`, where
 * the same clickable legend means writing out every item.
 */
export const InteractiveSeries: StoryObj = {
	render: () => ({ Component: ExpandSeriesDemo }),
	parameters: demoSource(ExpandSeriesDemoSource)
};

/**
 * `color` adjusts the continuous section of a color ramp. Its `interactive`
 * lets the reader drag the ends of the ramp to dim the cells outside a range
 * (or, with `mode: 'rescale'`, to refit the ramp to it). The legend holds one
 * range per figure, so with several color ramps only the first interactive one
 * works.
 */
export const InteractiveColorRamp: StoryObj = {
	render: () => ({ Component: ExpandColorDemo }),
	parameters: demoSource(ExpandColorDemoSource)
};

/**
 * A list adjusts each section of a channel separately. `match` names the
 * section by its title - the field (`population`), or the name of the function
 * that computes the channel - before the legend humanizes it, or as the legend
 * shows it ("Population").
 */
export const SeveralRampsWithMatch: StoryObj = {
	render: () => ({ Component: ExpandMatchDemo }),
	parameters: demoSource(ExpandMatchDemoSource)
};

/**
 * `size` and `symbol` adjust the sections the `r` and `symbol` channels add:
 * the values the size section shows and how they read (`values`, `format`), and
 * how many columns the shapes lay out in.
 */
export const SizeAndSymbol: StoryObj = {
	render: () => ({ Component: ExpandSizeSymbolDemo }),
	parameters: demoSource(ExpandSizeSymbolDemoSource)
};

/**
 * In a `PlotComposer`, the composer's `legend` adjusts the one legend its
 * panels share.
 */
export const InAComposer: StoryObj = {
	render: () => ({ Component: ExpandComposerDemo }),
	parameters: demoSource(ExpandComposerDemoSource)
};
