import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LayoutDemo from './LayoutDemo.svelte';
import NestedDemo from './NestedDemo.svelte';
import NestedDemoSource from './NestedDemo.svelte?raw';
import { layoutSource } from './layoutSource';
import ComposerNested from './ComposerNested.svelte';
import ComposerNestedSource from './ComposerNested.svelte?raw';
import { demoSource } from '../../../common/docsSource';

/**
 * Without `areas`, panels flow into a grid in the order they are declared and
 * `layout.columns` says how many columns it has; rows are added as needed. Use
 * it when the panels are interchangeable and no one needs a name. The stories
 * build up from a plain stack to rows of columns by nesting composers; every
 * panel here is a placeholder showing its label and the box it hands to a plot.
 */
const meta = {
	title: 'Composition/PlotComposer/Layout/Columns',
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

const flow = (count: number) => Array<string | undefined>(count).fill(undefined);

/** `columns: 1` stacks the panels, one per row. */
export const SingleColumn: Story = story({ layout: { columns: 1 }, panels: flow(3), height: 420 });

/** `columns: 2` fills each row left to right before starting the next. */
export const TwoColumns: Story = story({ layout: { columns: 2 }, panels: flow(4) });

/** The last row can be incomplete: with five panels in three columns, the second row has two. */
export const IncompleteRow: Story = story({ layout: { columns: 3 }, panels: flow(5) });

/** With no `layout` at all the grid is roughly square: five panels get three columns. */
export const AutomaticGrid: Story = story({ panels: flow(5) });

/** `widths` gives relative column sizes, one per column. */
export const ColumnWidths: Story = story({
	layout: { columns: 3, widths: [1, 2, 1] },
	panels: flow(3)
});

/** `heights` does the same for rows - here two rows, the first twice as tall. */
export const RowHeights: Story = story({
	layout: { columns: 2, heights: [2, 1] },
	panels: flow(4)
});

/** `gap` sets the space between cells, in pixels (12 by default). */
export const Gap: Story = story({ layout: { columns: 2, gap: 32 }, panels: flow(4) });

/** `tags` letters the panels in flow order. */
export const Tags: Story = story({ layout: { columns: 2 }, panels: flow(4), tags: 'A' });

/** `tags: 'I'` numbers the panels with Roman numerals (I, II, III…); `'i'`
 * gives lowercase, and `'a'` and `'1'` give lowercase letters and plain
 * numbers. */
export const OtherTags: Story = story({ layout: { columns: 2 }, panels: flow(4), tags: 'I' });

/**
 * A single grid can't make rows with different numbers of columns, but a
 * `PlotComposer` can sit inside another: a one-column composer stacks a
 * full-width panel over a nested two-column composer.`.
 */
export const Nested: StoryObj = {
	render: () => ({ Component: NestedDemo }),
	parameters: demoSource(NestedDemoSource)
};

/** The same nesting with real plots, and tags that restart inside the inner composer. */
export const NestedWithPlots: StoryObj = {
	render: () => ({ Component: ComposerNested }),
	parameters: demoSource(ComposerNestedSource)
};
