import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LayoutDemo from './LayoutDemo.svelte';
import { layoutSource } from './layoutSource';
import ComposerAreas from './ComposerAreas.svelte';
import ComposerAreasSource from './ComposerAreas.svelte?raw';
import { demoSource } from '../../../common/docsSource';

/**
 * `PlotComposer` combines separate plots into one figure (the way patchwork does
 * for ggplot): each `PlotPanel` child receives its box and renders any plot, and
 * the composer carries the figure's own title, legend, caption, panel tags,
 * shared hover and a shared timeline.
 *
 * `layout.areas` describes the figure as a grid of names, one string per row:
 * each name is a cell, a name repeated across cells spans them, and `.` leaves
 * a cell empty. A `PlotPanel` is placed by giving it the `area` it should fill.
 * The stories build up from one area to a full dashboard; every panel here is a
 * placeholder showing its label and the box it hands to a plot.
 */
const meta = {
	title: 'Composition/PlotComposer/Layout/Areas',
	component: LayoutDemo,
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta<typeof LayoutDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

const story = (args: Story['args'] & { panels: (string | undefined)[] }): Story => ({
	args,
	parameters: layoutSource(args)
});

/** The smallest layout: one name, one cell, and the panel fills the whole figure. */
export const SingleArea: Story = story({ layout: { areas: ['a'] }, panels: ['a'] });

/** Names in the same row string sit side by side: `'a b'` is one row of two cells. */
export const TwoInARow: Story = story({ layout: { areas: ['a b'] }, panels: ['a', 'b'] });

/** Each string is a row, so two strings stack: `['a', 'b']`. */
export const TwoInAColumn: Story = story({ layout: { areas: ['a', 'b'] }, panels: ['a', 'b'] });

/** Rows and columns combine into a grid. */
export const Grid: Story = story({
	layout: { areas: ['a b', 'c d'] },
	panels: ['a', 'b', 'c', 'd']
});

/** Repeating a name makes its panel span those cells - here `a` takes the whole top row. */
export const Spanning: Story = story({
	layout: { areas: ['a a', 'b c'] },
	panels: ['a', 'b', 'c']
});

/** A tall panel beside two stacked ones: `a` spans two rows, `b` and `c` take one each. */
export const SpanningRows: Story = story({
	layout: { areas: ['a b', 'a c'] },
	panels: ['a', 'b', 'c']
});

/** A `.` leaves its cell empty, so panels can sit off-grid. */
export const EmptyCells: Story = story({
	layout: { areas: ['a a .', 'b c c'] },
	panels: ['a', 'b', 'c']
});

/**
 * By default every column and row is the same size. `widths` and `heights` give
 * relative sizes, one per track: `[2, 1]` makes the first twice as wide as the second.
 */
export const TrackSizes: Story = story({
	layout: { areas: ['a b', 'c c'], widths: [2, 1], heights: [3, 1] },
	panels: ['a', 'b', 'c']
});

/** `gap` sets the space between cells, in pixels (12 by default). */
export const Gap: Story = story({
	layout: { areas: ['a b', 'c d'], gap: 32 },
	panels: ['a', 'b', 'c', 'd']
});

/** `tags` letters the panels in the order they are declared, not by position on the grid. */
export const Tags: Story = story({
	layout: { areas: ['a a b', 'a a c'] },
	panels: ['a', 'b', 'c'],
	tags: 'A'
});

/** `tags: 'I'` numbers the panels with Roman numerals (I, II, III…); `'i'` gives lowercase, and `'a'` and `'1'` give lowercase letters and plain numbers. */
export const OtherTags: Story = story({
	layout: { areas: ['a a b', 'a a c'] },
	panels: ['a', 'b', 'c'],
	tags: 'I'
});

/** Putting it together: a main chart beside two smaller ones, each panel holding a real plot. */
export const Dashboard: StoryObj = {
	render: () => ({ Component: ComposerAreas }),
	parameters: demoSource(ComposerAreasSource)
};
