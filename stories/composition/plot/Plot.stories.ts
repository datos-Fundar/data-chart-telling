import type { Meta, StoryObj } from '@storybook/svelte-vite';
import Interchange from './Interchange.svelte';
import MinardMapDemo from './MinardMapDemo.svelte';
import MinardRainDemo from './MinardRainDemo.svelte';
import MinardPlot from './MinardPlot.svelte';
import MinardNative from './MinardNative.svelte';
import InterchangeSource from './Interchange.svelte?raw';
import MinardMapDemoSource from './MinardMapDemo.svelte?raw';
import MinardMapSource from './MinardMap.svelte?raw';
import MinardRainDemoSource from './MinardRainDemo.svelte?raw';
import MinardRainSource from './MinardRain.svelte?raw';
import MinardPlotSource from './MinardPlot.svelte?raw';
import MinardNativeSource from './MinardNative.svelte?raw';
import { demoSource } from '../../common/docsSource';

/**
 * Every plot kind wraps itself in the same `Plot`: container, timeline,
 * facet and legend are optional props shared by all of them, and `Plot`
 * itself is exported for wrapping anything else.
 */
const meta = {
	title: 'Composition/Custom Plots',
	component: Interchange,
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta<typeof Interchange>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every plot kind draws its own chrome (title, subtitle, caption, legend,
 * timeline and facet), so swapping kinds swaps the whole plot, chrome
 * included - nothing is shared between them. What stays is the props: the same
 * ones are accepted by a line, bar and heatmap plot, and here they are
 * interchanged next to one external scrubber that drives each one's timeline.
 *
 * To lay several plots out in one figure with a shared chrome, use
 * `PlotComposer`.
 */
export const InterchangeablePlots: Story = {
	parameters: demoSource(InterchangeSource)
};

/**
 * `Plot`'s `cell` snippet doesn't require one of this package's own plot
 * kinds - anything that accepts `{ data, width, height }` fits. Here it's
 * svelteplot's raw `<Plot>`, assembled by hand (marks, a blur-masked `<defs>`
 * glow, custom projection fitting) instead of going through a plot kind, yet
 * it still gets a title/subtitle/caption, a discrete legend and a scrubbable
 * timeline from the same chrome every plot kind uses.
 */
export const SvelteplotCompatibility: Story = {
	render: () => ({ Component: MinardMapDemo }),
	parameters: demoSource(MinardMapDemoSource + '\n\n' + MinardMapSource)
};

/**
 * The same `cell` hands svelteplot's own marks any shape of chart: Minard's
 * table of temperature, a line whose color follows its value through a
 * `LinearGradientY` painted onto the stroke. Its timeline grows the line from
 * east to west, as the army retreats - empty until the march turns back.
 */
export const GradientLine: Story = {
	render: () => ({ Component: MinardRainDemo }),
	parameters: demoSource(MinardRainDemoSource + '\n\n' + MinardRainSource)
};

/**
 * Both in one `PlotComposer`: a single timeline scrubs the map and the table,
 * and the map shares its projection, so each temperature reading sits under the
 * place on the map where the army was.
 */
export const MinardFigure: Story = {
	render: () => ({ Component: MinardPlot }),
	parameters: demoSource(MinardPlotSource)
};

/**
 * Minard's figure again, with this package's own plots and markers instead of
 * hand-assembled svelteplot: a `GeoPlot` (`trail`, `line`, `dot` and `text`
 * markers) over a `LinePlot`, one composer timeline. Compare with
 * `MinardFigure` to see what the markers reach on their own.
 */
export const MinardNativePlots: Story = {
	render: () => ({ Component: MinardNative }),
	parameters: demoSource(MinardNativeSource)
};
