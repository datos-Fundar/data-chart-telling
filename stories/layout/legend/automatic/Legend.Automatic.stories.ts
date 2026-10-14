import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
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
import ComposerDemo from './ComposerDemo.svelte';
import ComposerDemoSource from './ComposerDemo.svelte?raw';
import AddItemsDemo from './AddItemsDemo.svelte';
import AddItemsDemoSource from './AddItemsDemo.svelte?raw';
import AddSectionsDemo from './AddSectionsDemo.svelte';
import AddSectionsDemoSource from './AddSectionsDemo.svelte?raw';
import NamedMarksDemo from './NamedMarksDemo.svelte';
import NamedMarksDemoSource from './NamedMarksDemo.svelte?raw';
import { demoSource } from '../../../common/docsSource';
import { LIFE_EXPECTANCY, FEMALE_LIFE_EXPECTANCY } from '../../../plots/line/data';
import type { LegendSection } from '$lib/types/layout/legend';

/**
 * Every plot shows a legend by default, read off what it draws: as each plot
 * resolves, it registers its series - name, color and how it draws them -
 * on its figure's `LegendState`, and the figure shows them. A plot with a
 * single series shows none.
 *
 * `legend` decides what the figure shows:
 * - unset or `true`: the automatic legend;
 * - `false`: no legend;
 * - a list of sections: exactly those, as in `Layout/Legend/Discrete` and the
 *   other `LegendLayout` stories;
 * - `{ items, sections }`: the automatic legend with those added.
 *
 * A segment or a marker joins the automatic legend by naming itself with its
 * own `legend`: a label, or an item with its own color, symbol or line style.
 */
const meta = {
	title: 'Layout/Legend/Automatic',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 760,
		height: 360,
		data: LIFE_EXPECTANCY,
		x: 'year',
		y: 'value',
		color: 'sex'
	},
	argTypes: {
		legend: {
			description:
				'Unset or `true`: the legend the plot reads off what it draws. `false`: none. A list of sections: exactly those. `{ items, sections }`: the automatic one with those added.',
			control: false
		}
	},
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
 * In a `PlotComposer`, the panels leave their legend to the composer: it
 * shows every series its plots draw, once. A panel that sets `legend` shows
 * its own instead.
 */
export const InAComposer: StoryObj = {
	render: () => ({ Component: ComposerDemo }),
	parameters: demoSource(ComposerDemoSource)
};

/**
 * `legend: { items }` keeps the automatic legend and adds items to its series
 * section - here, one explaining the highlighted part of the female curve.
 */
export const AddItems: StoryObj = {
	render: () => ({ Component: AddItemsDemo }),
	parameters: demoSource(AddItemsDemoSource)
};

/**
 * `legend: { sections }` keeps the automatic legend and adds whole sections
 * after it. With other sections beside it, the series section is titled
 * "Series" - set `legend.seriesTitle` in the configuration to change the text
 * (`text`) or leave it untitled (`enabled: false`).
 */
export const AddSections: StoryObj = {
	render: () => ({ Component: AddSectionsDemo }),
	parameters: demoSource(AddSectionsDemoSource)
};

/**
 * A segment or marker names itself on the automatic legend with its own
 * `legend`. A label alone (the segment here) takes the color and mark it
 * draws with; an item (the threshold rule) sets its own label, color,
 * symbol or line style - here, a dashed line.
 */
export const NamedSegmentsAndMarkers: StoryObj = {
	render: () => ({ Component: NamedMarksDemo }),
	parameters: demoSource(NamedMarksDemoSource)
};
