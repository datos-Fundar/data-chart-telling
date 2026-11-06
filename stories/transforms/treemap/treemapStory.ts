import type { ComponentProps } from 'svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { TreemapTransform } from '$lib/types/transforms/treemap';
import { TREEMAP_ROW } from '$lib/phases/transforms/methods/TreemapTransform';
import { ACTIVITY_BRANCHES } from '$datasets';

// `treemap` lays the rows out as nested tiles: one tile per distinct path of `levels` (outermost
// first), with an area proportional to the sum of its rows' `value`. It gives a `rect` its
// `x1`/`x2`/`y1`/`y2` in the unit square, and a `text` the centre of each tile as `x`/`y`. The name,
// path, value and share (0 to 1) of every tile are left on its row, under the `TREEMAP_ROW` keys.
// It works on any plot kind, so the stories draw it over a LinePlot with no data of its own.

/** The Gross Added Value of Buenos Aires, by sector, kind and branch of activity. */
export const ACTIVITY = ACTIVITY_BRANCHES;

/** The args every treemap transform story shares: a plot with no data and axes that are not needed. */
export const treemapArgs = {
	width: 940,
	height: 460,
	data: [],
	x: 'x',
	y: 'y',
	scales: {
		x: { domain: [0, 1], axisDisplay: 'none' },
		y: { domain: [0, 1], axisDisplay: 'none' }
	}
} satisfies Partial<ComponentProps<typeof LinePlot>>;

/** The controls every treemap transform story shares. */
export const treemapArgTypes = {
	width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
	height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
	data: { control: false },
	markers: { control: false }
} as const;

/** The tiles, colored by sector, the ones large enough named after their last level. */
export const tiles = (
	options: Omit<TreemapTransform, 'type'> = { levels: ['sector', 'branch'] }
): AxisBasedMarkersConfig[] => {
	const transform = { type: 'treemap', value: 'value', ...options } as TreemapTransform;
	const named = (d: Record<symbol, unknown>) =>
		Number(d[TREEMAP_ROW.share]) >= 0.03 ? String(d[TREEMAP_ROW.name]) : '';
	return [
		{
			type: 'rect',
			data: ACTIVITY,
			x1: 'x1',
			x2: 'x2',
			y1: 'y1',
			y2: 'y2',
			color: 'sector',
			transforms: [transform],
			styles: { insetLeft: 1, insetRight: 1, insetTop: 1, insetBottom: 1 }
		},
		{
			type: 'text',
			data: ACTIVITY,
			x: 'x',
			y: 'y',
			text: named,
			transforms: [transform],
			styles: { fontSize: 12, fill: 'white' }
		}
	];
};
