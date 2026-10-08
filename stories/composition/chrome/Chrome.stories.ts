import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import ChromeHeaderFooter from './ChromeHeaderFooter.svelte';
import ChromeDividerStyle from './ChromeDividerStyle.svelte';
import ChromeComposer from './ChromeComposer.svelte';
import ChromeHeaderFooterSource from './ChromeHeaderFooter.svelte?raw';
import ChromeDividerStyleSource from './ChromeDividerStyle.svelte?raw';
import ChromeComposerSource from './ChromeComposer.svelte?raw';
import { demoSource } from '../../common/docsSource';
import { TIME_SERIES } from '../../data/time-series';
import type { LegendSection } from '$lib/types/layout/legend';

/**
 * What's drawn around a plot: `title`, `subtitle`, `caption`, a `legend`,
 * `header`/`footer` snippets in place of the text, and dividers between
 * blocks. Every plot kind and `PlotComposer` take the same props, and
 * `order` lists the blocks top to bottom - only the ones passed, plus `plot`
 * and any number of `divider`s, checked by the props' type.
 */
const meta = {
	title: 'Composition/Chrome',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 680,
		height: 440,
		data: TIME_SERIES.filter((d) => d.region === 'North'),
		x: 'year',
		y: 'value',
		color: 'metric'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		legend: { control: false },
		order: { control: false }
	},
	parameters: {
		layout: 'padded',
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const LEGEND: LegendSection[] = [
	{
		type: 'discrete',
		columns: 2,
		items: [
			{ name: 'GDP', symbol: 'line' },
			{ name: 'Employment', symbol: 'line' }
		]
	}
];

const CAPTION = 'Source: synthetic demo data.';

/**
 * The default order: title and subtitle, a divider, the legend, the plot and
 * the caption.
 */
export const Default: Story = {
	args: {
		title: 'GDP vs. Employment',
		subtitle: 'North region, 2018-2022',
		caption: CAPTION,
		legend: LEGEND
	}
};

/**
 * The default divider only sits under a title, subtitle or header: with none
 * of them, nothing is above it, so it isn't drawn.
 */
export const NoHeadingNoDivider: Story = {
	args: {
		caption: CAPTION,
		legend: LEGEND
	}
};

/**
 * `divider` can sit in `order` as many times as wanted, between any two
 * blocks. Each one only draws between two drawn blocks, so a run of them
 * draws one line, and one at either end draws none.
 */
export const ManyDividers: Story = {
	args: {
		title: 'GDP vs. Employment',
		subtitle: 'North region, 2018-2022',
		caption: CAPTION,
		legend: LEGEND,
		order: ['title', 'subtitle', 'divider', 'legend', 'divider', 'plot', 'divider', 'caption']
	}
};

/** `order` moves the plot to the top and the heading below it, with a divider between them. */
export const CustomOrder: Story = {
	args: {
		title: 'GDP vs. Employment',
		subtitle: 'North region, 2018-2022',
		caption: CAPTION,
		legend: LEGEND,
		order: ['title', 'subtitle', 'divider', 'caption', 'divider', 'plot', 'divider', 'legend']
	}
};

/**
 * A block left out of `order` isn't drawn - here the subtitle and the legend -
 * and `plot`, when left out, goes last.
 */
export const LeaveBlocksOut: Story = {
	args: {
		title: 'GDP vs. Employment',
		subtitle: 'North region, 2018-2022',
		caption: CAPTION,
		legend: LEGEND,
		order: ['title', 'divider', 'caption']
	}
};

/**
 * `header` and `footer` snippets replace the text blocks with any markup, and
 * take part in `order` like the blocks they replace.
 */
export const HeaderAndFooter: StoryObj = {
	render: () => ({ Component: ChromeHeaderFooter }),
	parameters: demoSource(ChromeHeaderFooterSource)
};

/** The configuration's `divider` styles every divider: color, width, style and margin. */
export const DividerStyle: StoryObj = {
	render: () => ({ Component: ChromeDividerStyle }),
	parameters: demoSource(ChromeDividerStyleSource)
};

/** `PlotComposer` takes the same chrome props, `order` included, around its panels. */
export const OnAComposition: StoryObj = {
	render: () => ({ Component: ChromeComposer }),
	parameters: demoSource(ChromeComposerSource)
};
