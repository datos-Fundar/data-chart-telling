# Markers

`markers` adds marks to a plot beyond the ones its kind draws: annotations, regions, derived shapes, hover highlights, or any Svelte component. It is an array of objects; `type` picks the marker and the other fields configure it.

<!-- example: examples/Markers.svelte -->

```svelte
<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { LIFE } from './datasets';
</script>

<!-- Markers add marks to a plot: a hover highlight, a reference rule and a delta between two series. -->
<LinePlot
	width={720}
	height={400}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	scales={{ x: { edgeTicks: true } }}
	markers={[
		{ type: 'hover' },
		{ type: 'rule', axis: 'x', value: 2001, styles: { stroke: '#999', strokeDasharray: '4 4' } },
		{
			type: 'delta',
			axis: 'x',
			at: 1980,
			from: { type: 'series', series: 'female' },
			to: { type: 'series', series: 'male' },
			formatDiff: (difference) => difference.toFixed(1)
		}
	]}
/>
```

<!-- /example -->

![A line plot with a reference rule and a delta between two series](images/markers.png)

Markers draw in array order. Type a markers array with `satisfies AxisBasedMarkersConfig[]` (or `GeoMarkersConfig[]`) to get completion.

### Numbers in `text` and `delta` markers

A `text` marker's `text` is a string, a number, the name of a field of its rows, or a function of the row giving a string or a number. A number - given, read from a field, or returned - is written as the marker's own `decimals`, `prefix`, `suffix` and `signDisplay` ask ([Number format](theming.md#number-format)); a string is drawn as it is.

```ts
{ type: 'text', data: rows, x: 'year', y: 'share', text: 'share', decimals: 1, suffix: ' %' }
```

A `delta` writes its distance the same way, with one decimal unless `decimals` or `numbers.decimals` says otherwise. `formatDiff` writes it by hand instead: a string it returns is shown as it is, and a number (a percentage of a baseline, say) is written as the display fields ask.

## Fields every marker shares

| Field                      | Meaning                                                                                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                     | The marker's own rows. Unset, it draws the plot's rows                                                                                                                                          |
| `x`, `y`, `grouping`       | Accessors, when the marker reads other fields than the plot (a `bollinger` marker takes the plot's own `x` and `y` when it sets none)                                                           |
| `series`                   | Draw over one series only (by name)                                                                                                                                                             |
| `scope`                    | With `series`: `'series'` (default) draws once over the whole series; `'segment'` draws once per [segment](styles-and-segments.md), in its color - a `selectMaxY` marks each segment's own peak |
| `scales`                   | The marker's own `color`/`opacity`/`symbol` scales, independent of the plot's                                                                                                                   |
| `transforms`, `statistics` | Derive rows for this marker ([Transforms](transforms-and-statistics.md))                                                                                                                        |
| `clip`                     | Clip to the plot's frame                                                                                                                                                                        |
| `dx`, `dy`                 | Move the marker this many pixels right and down, on a map too. A `dot`, `text` or `image` marker also takes a function of the row, to move each row on its own: `dy: (row) => row.side * 15`    |
| `legend`                   | Name the marker on the automatic [legend](legend.md)                                                                                                                                            |

Many markers also take channel fields (`color`, `fill`, `opacity`, `r`, `symbol`, `weight`, `x1`/`x2`/`y1`/`y2`) and a `styles` object (`StrokeStyle`, `AreaStyle`, `DotStyle` or `FontStyle` depending on the mark).

## Catalog for axis-based plots

| `type`                                                   | Draws                                                                                                                                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dot`                                                    | A point per row; `r`, `color`, `symbol`, `styles` (`DotStyle`)                                                                                                                                      |
| `text`                                                   | A label per row; `text` (string or function), `styles` (`FontStyle`), `declutter`, `edgeAware`, `fitMargins`, `fit`                                                                                 |
| `line`                                                   | A line through the rows                                                                                                                                                                             |
| `rule`                                                   | A reference line: `axis: 'x' \| 'y'`, `value` (a list draws a line at each, or a function with `data`), `styles` (`StrokeStyle`, and `inset`, `insetTop`, ... to pull it in from its ends)          |
| `tick`                                                   | A short tick per row along one axis                                                                                                                                                                 |
| `bar`                                                    | A bar; `rect`, `cell`: rectangles and heatmap cells                                                                                                                                                 |
| `rect`                                                   | A rectangle from `x1`/`x2`/`y1`/`y2`; `interval` turns `x`/`y` into ranges; `styles` (`AreaStyle`, and `inset`, `insetLeft`, ...); `label`, a text in each (`cell`, `bar` and `waffle` take it too) |
| `area`                                                   | A filled area under a curve, or between `y1` and `y2`; `curve`                                                                                                                                      |
| `difference`                                             | The area between two series, colored by which one is on top                                                                                                                                         |
| `arrow`                                                  | An arrow from `x1,y1` to `x2,y2`; `bend`, `headAngle`, `headLength`, `styles` (`StrokeStyle`, and `inset`, `insetStart`, `insetEnd`)                                                                |
| `trail`                                                  | A variable-width ribbon along a path, its width set by `r`                                                                                                                                          |
| `delta`                                                  | The distance between two series (or a series and a fixed value) at a position - or at each of a list of them, `at: [1980, 2000]` - as a line and a label                                            |
| `hull`                                                   | The convex hull around a cluster of points                                                                                                                                                          |
| `density`                                                | 2D density contour bands                                                                                                                                                                            |
| `box`                                                    | A box plot; sub-marks styled through `bar`, `rule`, `dot`, `tickMedian`, `tickMinMax`; `thickness` sets its width in pixels, `slot` its share of a band                                             |
| `violin`                                                 | A violin per category of its rows: the mirrored density of `y` (or `x`), `kernel`, `bandwidth`, `trim`, `peak`, `slot`; add a narrow `box` over the same rows for the box inside                    |
| `regression`, `bollinger`                                | A fitted curve, a moving-average band                                                                                                                                                               |
| `waffle`                                                 | The value as a grid of unit squares; `unit`, `multiple`, `gap`                                                                                                                                      |
| `voronoi`, `voronoiMesh`, `delaunayLink`, `delaunayMesh` | Voronoi cells and Delaunay triangulation                                                                                                                                                            |
| `image`                                                  | An image per row; `src`, `width`, `height`                                                                                                                                                          |
| `raster`                                                 | A field sampled over a rectangle, drawn to a canvas                                                                                                                                                 |
| `brush`                                                  | A drag-to-select rectangle with `onbrushstart`, `onbrush`, `onbrushend`                                                                                                                             |
| `hover`                                                  | The in-plot hover highlight (see below)                                                                                                                                                             |
| `component`                                              | Your own Svelte component (see below)                                                                                                                                                               |

## Markers in some facets

On a plot with a [`facet`](facets.md#markers-and-segments-in-some-panels), every marker is drawn in every panel. A marker takes `facet`, a panel's value or a list of them, to be drawn only in the panels it names.

## Several positions at once

A `rule` takes a list as its `value`, and a `delta` a list as its `at`. One marker then draws one line, or one delta, at each position, all with the same style and the same ends - instead of one marker for each.

```ts
markers={[
	// A rule at each of the three years.
	{ type: 'rule', axis: 'x', value: [1991, 2001, 2010], styles: { strokeDasharray: '4 4' } },
	// The gap between the two series at each of the three.
	{ type: 'delta', axis: 'x', at: [1991, 2001, 2010], from: { type: 'series', series: 'female' }, to: { type: 'series', series: 'male' } }
]}
```

A delta's `stroke`, `text` and `dot` can be functions of the position, to style each one on its own - a label to the left of the last one, say, so it stays inside the plot:

```ts
{
	type: 'delta', axis: 'x', at: [1991, 2001, 2022], from: { type: 'series', series: 'female' }, to: { type: 'series', series: 'male' },
	text: (at) => (at === 2022 ? { dx: -20, textAnchor: 'end' } : { dx: 20 })
}
```

Every other marker draws from `data` rows, one mark per row, so it already takes many positions.

## Hover highlight

`{ type: 'hover' }` draws a crosshair, a dot and a label at the hovered point. It makes the plot hoverable on its own; add `tooltip` for a floating box too. Fields: `strategy`, `sync`, `ruleX`, `ruleY`, `areaX`, `areaY` (a band highlight on band scales), `showLabels`, `format`, the number fields `decimals`, `prefix`, `suffix` and `signDisplay` (they write the label's value; `format` gets a `number` function that does the same), and the styles `rule`, `area`, `dot`, `text`. See [Tooltip and hover](tooltip-and-hover.md).

## Styles that depend on the row

Everything a marker is drawn with goes in its `styles` - its colors, strokes and insets - and none of it sits beside `type`, `data` and the channels.

On the markers that draw a shape for each row - `rect`, `bar`, `cell`, `waffle`, `dot`, `tick`, `rule`, `arrow`, `voronoi` and `delaunayLink` - any field of `styles` can be a function of the row in place of a value, so each shape gets its own (`rect`, `cell`, `rule` and `arrow` take the insets that way too; `bar`'s are fractions of its band, the same for all):

```ts
{ type: 'rect', data: eras, x1: 'from', x2: 'to', y1: 0, y2: 100,
  styles: { fill: 'steelblue', fillOpacity: (era) => (era.name === locked ? 0.55 : 0.12) } }
```

A color or an opacity the function returns is drawn as it is, not mapped through a scale. Where the function would only read a field, name the field: a number (`strokeWidth`, `fillOpacity`, an inset...) given as a string is the field of the rows, and so is a color when the rows have a field of that name - `fill: 'tint'` reads `row.tint`, but `fill: 'tomato'` is the color unless some row has a `tomato` field. A `text` marker does the same with `fill`, `fillOpacity`, `stroke`, `strokeWidth`, `fontWeight` and `fontStyle`; the other fields place and measure the labels, so they are one value for all. The markers that draw one shape for many rows (`line`, `area`, `density`, `hull`, a mesh) take plain values.

## A label in each shape

A `rect`, `cell`, `bar` or `waffle` marker takes a `label`: a text written in the middle of each shape, with every option of a `text` marker but `type`, `data`, `x` and `y`, which the shape sets. It never takes the pointer from the shape under it, so `onclick` and the hover go on as they were.

```ts
{ type: 'rect', data: tiles, x1: 'x1', x2: 'x2', y1: 'y1', y2: 'y2',
  label: { text: 'name', styles: { fill: 'white' }, fit: { fallback: 'value' } } }
```

`anchor` puts the label against an edge (`'top'`, `'bottom'`, `'left'`, `'right'`) or in a corner (`'top-left'`...) instead of the middle, and `outside` puts one anchored to an edge beyond it; `gap` is its distance from the edge. A label outside is not fitted, and `fitMargins: true` grows the plot's margins to hold it where it would run past them. A label with a handler of its own (`onpointerenter`...) listens for the pointer; the others leave it to the shape. Its styles take functions of the row, to dim the label of a series, say.

The label is fitted to its shape unless `fit` is `false`. One too big is written smaller, down to `minFontSize`; at that size it breaks into the lines the shape holds and the last one is cut short with an ellipsis; when fewer than `minLetters` letters would show, `fallback` - a value, a field or a function of the row - is written instead; and when not even that fits, nothing is. `padding` is the room kept free inside each edge. The defaults of `gap`, `padding`, `minFontSize` (8) and `minLetters` (3) are the configuration's `text.label`: `setConfiguration({ text: { label: { gap: 6 } } })`. A `text` marker of your own takes the same `fit` with a box of its own (`x1`, `x2`, `y1`, `y2`), which is rarely what you want.

## Events

Every marker takes handlers for the pointer:

```svelte
<LinePlot
	...
	markers={[
		{
			type: 'rect',
			data: eras,
			x1: 'from',
			x2: 'to',
			y1: 0,
			y2: 100,
			onclick: (event, era) => select(era)
		}
	]}
/>
```

- `onclick`, `ondblclick`, `oncontextmenu`, `onpointerdown`, `onpointerup`, `onpointerenter`, `onpointerleave`, `onpointermove`, `onmouseenter` and `onmouseleave` are called with the event, the row the shape draws and its index.
- Every marker that draws a svelteplot shape takes them (`brush`, `hover`, `inset`, `delta` and the map's `features` and `geo-hover` have events of their own). svelteplot documents them on all its marks, but its code wires them up on some only today: `rect`, `bar`, `cell`, `area`, `arrow`, `dot`, `trail`, `vector`, `link`, `line`, `delaunayLink` and `voronoi`. On the others they do nothing yet.

## Custom components

`{ type: 'component', component: MyMark, props: { ... } }` mounts a Svelte component inside the plot's SVG. It can read the plot it is in with [`usePlot()`](state.md), so it can draw from the plot's scales, margins, hover and rows.

```svelte
<!-- HoverReadout.svelte -->
<script lang="ts">
	import { usePlot } from '@fundar/data-chart-telling';
	const plot = usePlot();
	const point = $derived(plot.hover.activePoint);
</script>

<text x={plot.margins.left + 8} y={plot.margins.top + 16}>
	{point ? `${point.series} at ${point.x}: ${point.label}` : 'Hover the plot'}
</text>
```

```svelte
<LinePlot
	...
	tooltip
	markers={[{ type: 'hover' }, { type: 'component', component: HoverReadout }]}
/>
```

## Markers on maps

`GeoPlot` accepts `dot` and `text` plus map-specific markers: `graticule`, `sphere`, `vector`, `link`, `contour`, `inset`, `geo-hover` and `geo-component`. They are described in [Maps](geo.md#markers).
