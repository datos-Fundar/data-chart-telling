import type { Meta } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { LIFE, REGION_VALUES } from '$datasets';
import { plotStory } from '../../common/plotStory';

/**
 * Each hovered point has a `label` - its value - that the markers the hover draws write (a `text` in `front`
 * does, unless told otherwise). The `hover` marker's number fields write it: `decimals`, `prefix`, `suffix` and
 * `signDisplay`, over the configuration's `numbers`. `format(context, number)` writes the whole label instead:
 * `context` is what the plot knows of the hovered row (its `x`, `y`, `value`, `series`, `row`...) and `number`
 * writes a value as the number fields ask.
 */
const meta = {
	title: 'Layout/Hover/Numbers',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const LINES = {
	width: 760,
	height: 380,
	data: LIFE,
	x: 'year',
	y: 'value',
	color: 'sex',
	// The years and the ages as they are: an axis niced past them leaves the lines in a corner.
	scales: { x: { nice: false }, y: { nice: false } }
};
const INFLATION = {
	width: 760,
	height: 380,
	data: REGION_VALUES,
	x: 'date',
	y: 'value',
	color: 'region'
};

/** The value as the plot writes it, while no number field is set. */
export const AsThePlotWritesIt = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [{ type: 'hover' }]
});

/** `decimals: 2`: every label with two decimals. */
export const Decimals = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [{ type: 'hover', decimals: 2 }]
});

/** `prefix` and `suffix`: a unit around the value. */
export const PrefixAndSuffix = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [{ type: 'hover', decimals: 1, prefix: '~', suffix: ' years' }]
});

/** `signDisplay: 'always'`: a sign on every value, `+` too - a monthly change reads better so. */
export const SignDisplay = plotStory(LinePlot, 'LinePlot', {
	...INFLATION,
	markers: [{ type: 'hover', decimals: 1, suffix: '%', signDisplay: 'always' }]
});

/**
 * `format(context, number)`: the whole label, from what the plot knows of the hovered row - here its series' name
 * before its value, written by `number`.
 */
export const Format = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [
		{
			type: 'hover',
			decimals: 1,
			format: (context, number) => `${context.series}: ${number(Number(context.value))}`
		}
	]
});

/**
 * A `text` of the author's own in `front` writes what it is given: here the point's `label` - as `format` wrote
 * it - in bold, without the dot.
 */
export const OwnText = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [
		{
			type: 'hover',
			suffix: ' years',
			front: [{ type: 'text', styles: { fontWeight: 'bold', fontSize: 14 } }]
		}
	]
});
