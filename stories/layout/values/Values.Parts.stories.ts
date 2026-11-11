import type { Meta } from '@storybook/svelte-vite';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import type { PlotRowContext } from '$lib';
import { INFLATION_RANGES, IRIS, PROVINCE_LIFE } from '$datasets';
import { plotStory } from '../../common/plotStory';

/**
 * A label writes a value of its row's context: `context.value` on most plots, which have one value per row. On a
 * plot whose rows have several, each is a **part** of its own, and `parts` picks the ones written:
 *
 * - a box or a violin: `'min'`, `'p25'`, `'median'`, `'p75'`, `'max'` and `'outliers'` (one label for each);
 * - a bullet: its bar's `'value'`, its `'target'` and its `'ranges'` bounds;
 * - a forest: its estimate's `'value'`, and its interval's `'lower'` and `'upper'` ends.
 *
 * `parts` is a list, or a record turning each part on (`true`) or giving it options of its own - where it sits, its
 * `format`. Every plot has parts: a simple one only its `'value'`. The type of `parts` takes only those of the plot,
 * and `format`'s `context.part` names the one written. `series` still picks the series labelled.
 */
const meta = {
	title: 'Layout/Values/Parts',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const SIZE = { width: 720, height: 360 };
/** Iris petal lengths, by species (Fisher, 1936). */
const PETALS = { ...SIZE, data: IRIS, x: 'species', y: 'petalLength', color: 'species' };

/** A box plot's default parts: its whiskers' ends and its median, beside each box. */
export const BoxDefault = plotStory(BoxPlot, 'BoxPlot', {
	...PETALS,
	styles: { area: { fillOpacity: 0.4 }, values: { show: true } }
});

/** A list picks the parts: here the median alone. */
export const OnlyTheMedian = plotStory(BoxPlot, 'BoxPlot', {
	...PETALS,
	styles: { area: { fillOpacity: 0.4 }, values: { parts: ['median'] } }
});

/**
 * A record gives a part options of its own: here each its own text. A `format` for all of them reads the part off
 * the `context`.
 */
export const OwnOptionsPerPart = plotStory(BoxPlot, 'BoxPlot', {
	...PETALS,
	styles: {
		area: { fillOpacity: 0.4 },
		values: {
			parts: { min: true, median: { format: (v: number) => `median ${v} cm` }, max: true },
			format: (v: number, _number: unknown, { part }: PlotRowContext) => `${part} ${v}`
		}
	}
});

/** `series` labels the boxes of one series only. */
export const OneSeries = plotStory(BoxPlot, 'BoxPlot', {
	...PETALS,
	styles: {
		area: { fillOpacity: 0.4 },
		values: { series: 'virginica', parts: ['min', 'p25', 'median', 'p75', 'max'] }
	}
});

/** A bullet's target, beside each band, with its bar's value: female life expectancy by province against 80 years. */
export const BulletTarget = plotStory(BulletPlot, 'BulletPlot', {
	...SIZE,
	data: PROVINCE_LIFE,
	x: 'female',
	y: 'province',
	target: 80,
	ranges: [76, 80, 85],
	scales: { x: { domain: [70, 85] as [number, number] } },
	styles: { values: { parts: ['value', 'target'] } }
});

/** A forest's interval ends, each past its own side: the range of monthly inflation by region and year (INDEC). */
export const ForestIntervalEnds = plotStory(ForestPlot, 'ForestPlot', {
	...SIZE,
	height: 480,
	data: INFLATION_RANGES,
	x: 'mean',
	y: 'period',
	lower: 'min',
	upper: 'max',
	color: 'region',
	styles: { values: { parts: ['value', 'lower', 'upper'] } }
});
