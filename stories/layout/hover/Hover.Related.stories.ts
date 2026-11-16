import type { Meta } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import { PENGUIN_COUNTS_BY_SEX, POPULATION_BY_AGE } from '$datasets';
import { plotStory } from '../../common/plotStory';

/**
 * `related` lights up more rows with the hovered one: a function of what the plot knows of the hovered row and of
 * every row the hover can reach - each one's context, with its `x`, `y`, `series` and whatever its kind works out,
 * and the `row` itself - which returns the ones that take `active` with it. The tooltip still reads the hovered
 * row alone.
 *
 * A plot kind can give one of its own, which an author's `related` replaces: a `SankeyPlot` lights up a hovered
 * node's links this way.
 */
const meta = {
	title: 'Layout/Hover/Related',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const SIZE = { width: 760, height: 460 };

/** The share of women of each age group, in every year the dataset has. */
const WOMEN = POPULATION_BY_AGE.filter((row) => row.sex === 'Female').map((row) => ({
	...row,
	year: String(row.year)
}));

/**
 * The hovered cell lights up its whole row and its whole column, and every other cell fades: the age group across
 * the years, and the year across the age groups.
 */
export const RowAndColumn = plotStory(HeatmapPlot, 'HeatmapPlot', {
	...SIZE,
	data: WOMEN,
	x: 'year',
	y: 'ageGroup',
	color: 'share',
	tooltip: true,
	markers: [
		{
			type: 'hover',
			related: (cell, cells) => cells.filter((other) => other.x === cell.x || other.y === cell.y),
			active: { stroke: '#111827', strokeWidth: 1 },
			others: { fillOpacity: 0.25 }
		}
	]
});

const PENGUINS = {
	...SIZE,
	data: PENGUIN_COUNTS_BY_SEX,
	columns: ['species', 'island', 'sex'],
	value: 'count',
	tooltip: true
};

/**
 * A `SankeyPlot` gives its hover a `related` of its own, so a hovered node lights up every link it is an end of -
 * with no `related` of the author's at all.
 */
export const SankeyNode = plotStory(SankeyPlot, 'SankeyPlot', {
	...PENGUINS,
	markers: [{ type: 'hover', others: { fillOpacity: 0.15 } }]
});

/**
 * An author's `related` replaces the sankey's own: here a hovered node lights up only the links that leave it,
 * and a hovered link every link that leaves the same node - where the penguins of a species or an island go.
 * Each context says whether its row is a node or a link, its source and its column.
 */
export const SankeyLeaving = plotStory(SankeyPlot, 'SankeyPlot', {
	...PENGUINS,
	markers: [
		{
			type: 'hover',
			related: (hovered, all) =>
				all.filter(
					(other) =>
						other.kind === 'link' &&
						other.source === hovered.source &&
						other.column === hovered.column
				),
			others: { fillOpacity: 0.15 }
		}
	]
});
