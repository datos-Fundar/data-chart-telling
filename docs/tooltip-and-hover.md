# Tooltip and hover

A plot becomes interactive when it is given a `tooltip`, a `{ type: 'hover' }` marker, or both. Hover is shared by every plot in a figure, so it can drive the other panels of a [facet](facets.md) or [composer](composer.md).

## Tooltip

<!-- example: examples/Tooltip.svelte -->

```svelte
<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './datasets';
</script>

<!--
	`tooltip` turns the floating box on (`true` for the defaults, or an object
	to tune it); a `hover` marker draws the in-plot crosshair, dot and label.
-->
<LinePlot
	width={720}
	height={400}
	data={REGION_VALUES}
	x="date"
	y="value"
	color="region"
	tooltip={{ strategy: 'x', format: (row) => `${row.region}: ${row.value}` }}
	markers={[{ type: 'hover' }]}
/>
```

<!-- /example -->

![A tooltip and a hover highlight on the hovered point](images/tooltip.png)

`tooltip` is `true` for the defaults, or an options object:

| Option               | Meaning                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `strategy`           | How related points are found: `'x'`, `'y'`, `'punctual'` (the exact point) or `'series'` (all points of the hovered series). Defaults per plot kind                                                                                                                                                                                                                |
| `sync`               | Show the highlight in every synced plot too (default `false`)                                                                                                                                                                                                                                                                                                      |
| `format`             | `(row) => string` - the tooltip text for the hovered row (`\n` breaks lines). With several rows, they read from the highest value to the lowest (a stacked row by its own value)                                                                                                                                                                                   |
| `content`            | A snippet `{#snippet content({ rows })}` replacing the text with custom markup. It gets the rows as the hover matched them, unsorted, each one your row plus a `seriesColor`: the one the plot draws it in (the series color, from `scales.color` or the palette). It is drawn in a plain card, so the markup brings its own order, background, colors and spacing |
| `series`             | Only these series appear in the tooltip                                                                                                                                                                                                                                                                                                                            |
| `anchorX`, `anchorY` | Preferred side of the cursor: `'left' \| 'middle' \| 'right'` (default `'right'`) and `'top' \| 'middle' \| 'bottom'` (default `'bottom'`). It moves to the other side when it would overflow                                                                                                                                                                      |

<!-- example: examples/CustomTooltip.svelte -->

```svelte
<script lang="ts">
	import { LinePlot, getConfiguration, paletteColor } from '@fundar/data-chart-telling';
	import TooltipCard from './TooltipCard.svelte';
	import { REGION_VALUES, type RegionRow } from './datasets';

	const { palette } = getConfiguration();
	const regions = [...new Set(REGION_VALUES.map((row) => row.region))];
</script>

<!--
	`content` replaces the tooltip text with your own markup, drawn in a plain
	card: TooltipCard brings its own background, colors and spacing. It is given
	every row the hover matched, in no particular order, so it sorts them itself;
	series colors come from the configuration's palette.
-->
{#snippet content({ rows }: { rows: RegionRow[] })}
	<TooltipCard
		heading={rows[0].date.toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		})}
		footer="Monthly inflation (%)"
		entries={[...rows]
			.sort((a, b) => b.value - a.value)
			.map((row) => ({
				label: row.region,
				color: paletteColor(regions.indexOf(row.region), palette),
				value: row.value,
				display: String(row.value)
			}))}
	/>
{/snippet}

<LinePlot
	width={720}
	height={400}
	data={REGION_VALUES}
	x="date"
	y="value"
	color="region"
	tooltip={{ strategy: 'x', content }}
	markers={[{ type: 'hover' }]}
/>
```

<!-- /example -->

![A tooltip with custom markup](images/custom-tooltip.png)

This is [examples/CustomTooltip.svelte](../examples/CustomTooltip.svelte); the card is [examples/TooltipCard.svelte](../examples/TooltipCard.svelte).

The default strategy follows the plot's axes: it matches along the category (or index) axis - points sharing the hovered `x` when the value axis is vertical, sharing `y` when it is horizontal - and `punctual` (the exact point) on heatmaps and scatter plots.

## In-plot hover

`markers={[{ type: 'hover' }]}` draws a dashed rule, a dot and a value label at the hovered point, inside the SVG. Its look comes from `hover` in the [configuration](theming.md) and can be overridden per marker (`rule`, `dot`, `text`, `area`). On band scales `areaX` / `areaY` highlight the whole band instead of a thin rule.

Use both together for the usual result:

```svelte
<LinePlot ... tooltip markers={[{ type: 'hover' }]} />
```

## Bars

On a `BarPlot` a hover candidate is the bar's whole band (or its series' slice, when grouped), so the tooltip triggers anywhere along the column.

## Syncing across plots

- In a [facet](facets.md) or a [`PlotComposer`](composer.md), `tooltip.sync: true` (or `hover.sync` on the composer) shows the hovered point's highlight, and the tooltip, in every panel. That replication is the feature: the same x is highlighted across panels.
- A composer's `hover={{ strategy, sync }}` sets the strategy and sync for all its panels.

## Maps

`GeoPlot` takes `tooltip` too (the row is the hovered feature) and the `{ type: 'geo-hover' }` marker, which restyles the hovered feature. See [Maps](geo.md).

## Reading hover from code

`useFigure().hover` and `usePlot().hover` expose `activeX`, `activeY`, `activeSeries`, `strategy`, `sync`, `source` and, for a plot, `points`, `activePoint` and `tooltip`. See [Reading plot state](state.md).
