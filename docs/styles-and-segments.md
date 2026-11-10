# Styles and segments

`styles` sets plot-wide options; `segments` restyles ranges of the data.

## Styles

`styles` is typed per plot kind, with these fields on the axis-based plots:

| Field    | Plots                                | Purpose                       |
| -------- | ------------------------------------ | ----------------------------- |
| `values` | all axis-based plots                 | Value labels on the marks     |
| `frame`  | all plots                            | A border around the plot area |
| `gaps`   | `LinePlot`, `BarPlot`, `PyramidPlot` | Bridges over missing values   |

`GeoPlot` has its own `styles` (base fill and stroke, tile layer, click handler) - see [Maps](geo.md).

### Value labels

<!-- example: examples/ValueLabels.svelte -->

```svelte
<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { PRICES } from './datasets';
</script>

<!-- End-of-line value labels with a custom format and font size. -->
<LinePlot
	width={720}
	height={400}
	data={PRICES}
	x="date"
	y="index"
	color="commodity"
	styles={{
		values: {
			show: true,
			format: (value, _number, context) => `${context.series}: ${value.toFixed(0)}`,
			fontStyle: { fontSize: 13 }
		}
	}}
/>
```

<!-- /example -->

![End-of-line value labels](images/value-labels.png)

| Field                                         | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `show`                                        | Draws the labels. Off by default, except on a heatmap or a treemap; setting any other field turns them on, unless `show: false`                                                                                                                                                                                                                                                                                                                                                     |
| `layout` and its options                      | How the labels are laid out, as a marker's `label` would be (see [Markers](markers.md#a-label-in-each-shape)); each plot takes the layouts its shapes do, with defaults of its own for each. `'point'`, beside a point: `side` (`'after'`, `'before'`, `'above'`, `'below'`, `'on'`) and `gap`; on a bar or a cell, `anchor` is the point of it the label starts at. `'path'`, along an edge or a line: `edge`, `side`, `offset`, `gap`. `'box'`, in each shape: `anchor` and `gap` |
| `select`                                      | Which row of each group is labelled: `'first'`, `'last'`, `'min'`, `'max'`, or a list of them. A group is a series on a line or area plot (default `'last'`), a category on the plots that join dots (default: every dot)                                                                                                                                                                                                                                                           |
| `series`                                      | Labels only these series, by name                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `color`                                       | `'series'` writes each label in its series' color; any other CSS color writes them all in it (`fontStyle.fill` wins)                                                                                                                                                                                                                                                                                                                                                                |
| `decimals`, `prefix`, `suffix`, `signDisplay` | How the value reads, over `numbers.decimals` ([Number format](theming.md#number-format)); `format` replaces them                                                                                                                                                                                                                                                                                                                                                                    |
| `format`                                      | `(value, number, context) => string`; `number` writes a value as the fields above ask, `context` is the labelled row's [context](state.md#row-context): its `series`, the `row` itself for its other fields, and what the plot works out                                                                                                                                                                                                                                            |
| `hoverIsolate`                                | Hovering a label dims every other series                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fontStyle`                                   | Text style: `fontSize`, `fill`, `fontWeight`, `rotate`, `class`, ... Where the text sits is the layout's: `side`, `gap`, `offset`                                                                                                                                                                                                                                                                                                                                                   |
| `strokeStyle`                                 | Style of the connector lines drawn from labels that had to move apart                                                                                                                                                                                                                                                                                                                                                                                                               |

Where the labels go depends on the plot: the end of each series on a line or area plot, one per bar on a bar, pyramid or histogram, one per point on a scatter, one per cell on a heatmap. Each plot has its own default layout, and takes the others its shapes write:

| Plot                                           | Default                                                 | Also                                                         |
| ---------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| Line, slope, sparkline                         | `'point'`, `side: 'after'`                              | `'path'`: each series' name along its line                   |
| Area                                           | `'point'`, `side: 'after'`                              | `'path'`: along its top (or bottom) `edge`                   |
| Bar, bullet, pyramid                           | `'path'` past each bar's tip (`'box'` on a stacked bar) | `'box'`, `'point'`; `edge: 'tip' \| 'base'` follow each sign |
| Histogram                                      | `'path'` past each bin's top                            | `'box'`, `'point'`                                           |
| Heatmap                                        | `'box'`                                                 | `'path'`, `'point'`                                          |
| Treemap                                        | `'box'`                                                 |                                                              |
| Scatter, Cleveland, dumbbell, lollipop, forest | `'point'`                                               | `'path'`: around each dot's rim                              |

```svelte
<BarPlot
	{data}
	x="region"
	y="value"
	styles={{ values: { layout: 'path', edge: 'base', side: 'inside' } }}
/>
<LinePlot {data} x="year" y="value" color="country" styles={{ values: { layout: 'path' } }} />
```

On lines, overlapping labels spread apart, share one column and are joined to their points by elbow connectors; the right margin grows to fit them when it is `'auto'`. On a scatter, each label takes a free spot around its point, and one with no room is left out. The spread is tuned by `text.declutter` in the [configuration](theming.md).

### Frame

`styles={{ frame: true }}` draws a border around the plot area; an object restyles it (`stroke`, `fill`, `inset`, `insetTop`, ...).

### Gaps

A row whose value is `null`, `undefined` or `NaN` breaks a line. `styles.gaps` bridges the break with a distinct, interpolated stretch. It is keyed by series name, or `'default'` for the series with no entry of their own, and has three zones: `start` (before the first real point), `middle` and `end` (after the last).

<!-- example: examples/Gaps.svelte -->

```svelte
<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { FEMALE_LIFE_GAPS } from './datasets';
</script>

<!-- Missing values bridged: dashed in the middle, faded at the start, extended to the 2025 projection at the end. -->
<LinePlot
	width={720}
	height={400}
	series={[{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_GAPS }]}
	scales={{ x: { edgeTicks: true }, y: { domain: [55, 85] } }}
	styles={{
		gaps: {
			default: {
				middle: { interpolate: 'linear', style: { stroke: { strokeDasharray: '4 4' } } },
				start: { x: 1940, style: { stroke: { strokeOpacity: 0.4 } } },
				end: { x: 2025, y: 81.1 }
			}
		}
	}}
/>
```

<!-- /example -->

![A line bridged across missing values with dashed segments](images/gaps.png)

- `middle` bridges holes between real points, `interpolate` is an easing name (default `'linear'`).
- `start` and `end` reach out to the given `x` (required to fill the zone), landing on `y` there (default: the nearest real value).
- On bar plots only the presence of `x` matters.
- Unset styles fall back to `line.gap`, `bar.gap` and `pyramid.gap` in the [configuration](theming.md).

### Basic styles

`styles.stroke`, `styles.dot` and `styles.area` set the style every series is drawn with, so `segments` are left for what only part of a series looks like. Each takes a style as it is, or a function of the series' name returning one (`undefined` leaves that series as it is):

```svelte
<LinePlot
	styles={{
		stroke: (name) =>
			name === 'male' ? { strokeWidth: 2, strokeOpacity: 0.5 } : { strokeWidth: 4 },
		dot: { dotRadius: 3 }
	}}
	...
/>
```

- A plot uses the ones its own marks are made of and ignores the rest, so one `styles` can be shared between plots:

  | Plot                                                                                                                                      | Uses                                                           |
  | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
  | `LinePlot`, `SlopePlot`, `SparklinePlot`                                                                                                  | `stroke` (the line), `dot` (a dot on every point; unset, none) |
  | `AreaPlot`, `BarPlot`, `BulletPlot`, `PyramidPlot`, `HistogramPlot`, `BoxPlot`, `DensityPlot`, `ViolinPlot`, `HeatmapPlot`, `TreemapPlot` | `area`                                                         |
  | `ScatterPlot`                                                                                                                             | `dot`                                                          |
  | `LollipopPlot`, `DumbbellPlot`, `ClevelandPlot`, `ForestPlot`                                                                             | `stroke` (the stems and connectors), `dot`                     |

  `GeoPlot` has styles of its own and uses none of them.

- On the plots with connectors, `styles.stroke` (or a segment's `stroke`) styles the stems and connectors: width, color, opacity, dashes and line caps and joins. What the author sets for a connector wins over it: a segment's `stroke` wins over `styles.connector`, which wins over `styles.stroke`. A function of the series styles only the connector of a lone dot, which has a series; the connector of several dots takes a style as it is.
- A series keeps the color of the `color` scale unless the style sets its own.
- A segment's own style wins over them, field by field, and what a legend turned off dims over both - so a `legend.off` fades a series without `segments` repeating its opacity.

## Segments

`segments` separates data ranges from their styling. It is an object: each key is a series name (a feature id for `GeoPlot`), or `'default'`, mapped to a list of segments.

```ts
type SegmentsConfig<TStyle> = Record<string, Segment<TStyle>[]>;
type Segment<TStyle> = { areas?: Area[]; styles?: TStyle; scales?: ...; legend?: MarkLegend };
type Area = { x?: Range; y?: Range };
type Range = { from?: AxisValue; to?: AxisValue }; // inclusive on both ends
```

- A segment applies to a data point (or heatmap cell) inside **any** of its `areas`.
- An `Area` limits by `x`, `y` or both; leaving one out leaves that axis open.
- A segment without `areas` is a **catch-all**: it matches every point, is evaluated last, and is overridden by any area-specific segment. A catch-all placed first is a baseline that highlighted ranges override.
- On a line, the piece that joins two runs of a series is drawn as the first area segment that covers both of its ends (its stroke, not its dots): a dashed range that starts at a year dashes the piece leaving it, even where a faded range ending there owns that year's point. One no area covers both ends of is drawn as the catch-all.
- `'default'` applies to every series; a named key applies to that series only, and wins over `'default'` where both match.
- `legend` names the segment on the automatic [legend](legend.md).
- `facet` limits the segment to the [facet panels](facets.md#markers-and-segments-in-some-panels) it names - a `by` value or a list of them. Without it the segment applies to every panel.

The style shape depends on the plot:

| Plot                        | Style type                         | Fields                                         |
| --------------------------- | ---------------------------------- | ---------------------------------------------- |
| `LinePlot`                  | `LineSegmentStyle`                 | `stroke` (line style), `dot` (dot style)       |
| `AreaPlot`, `HistogramPlot` | `AreaStyle`                        | `fill`, `fillOpacity`, `stroke`, ...           |
| `BarPlot`, `PyramidPlot`    | `BarSegmentStyle` (`AreaStyle`)    | `fill`, `fillOpacity`, `stroke`, ...           |
| `HeatmapPlot`               | `CellSegmentStyle` (`AreaStyle`)   | `fill`, `fillOpacity`, `stroke`, `strokeWidth` |
| `TreemapPlot`               | `BarSegmentStyle` (`AreaStyle`)    | `fill`, `fillOpacity`, `stroke`, ...           |
| `ScatterPlot`               | `ScatterSegmentStyle` (`DotStyle`) | dot fill, stroke, radius, symbol               |
| `GeoPlot`                   | `GeoSegmentStyle`                  | `fill`, `fillOpacity`, `stroke`, `strokeWidth` |

### Examples

A baseline color with a highlighted range:

<!-- example: examples/SegmentHighlight.svelte -->

```svelte
<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './datasets';

	const gba = REGION_VALUES.filter((row) => row.region === 'GBA');
</script>

<!-- A grey line with the 2023-2024 surge drawn in red. -->
<LinePlot
	width={720}
	height={380}
	series={[{ name: 'GBA', x: 'date', y: 'value', data: gba }]}
	segments={{
		GBA: [
			{ styles: { stroke: { stroke: '#94a3b8', strokeWidth: 1 } } },
			{
				areas: [{ x: { from: new Date('2023-07-01'), to: new Date('2024-03-01') } }],
				styles: { stroke: { stroke: '#ef4444', strokeWidth: 3 } }
			}
		]
	}}
/>
```

<!-- /example -->

![A grey line with a highlighted red range](images/segment-highlight.png)

Per-series colors, plus dots over a range shared by every series:

<!-- example: examples/SegmentsBySeries.svelte -->

```svelte
<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { LIFE } from './datasets';
</script>

<!-- Segments per series name, plus `default` for rules shared by every series. -->
<LinePlot
	width={720}
	height={380}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	scales={{ x: { edgeTicks: true } }}
	segments={{
		female: [{ styles: { stroke: { stroke: 'steelblue' } } }],
		male: [{ styles: { stroke: { stroke: 'tomato' } } }],
		default: [
			{
				areas: [{ x: { from: 1965, to: 1980 } }],
				styles: { dot: { dotRadius: 5, dotSymbol: 'circle' } }
			}
		]
	}}
/>
```

<!-- /example -->

![Two series colored individually, with dots on a shared range](images/segments-by-series.png)

Two areas in one segment, the second with a `y` limit:

```ts
{
	areas: [
		{ x: { from: 2010, to: 2012 } },
		{ x: { from: 2015, to: 2020 }, y: { from: 83.5, to: 84 } }
	],
	styles: { stroke: { strokeDasharray: '6 4' } }
}
```

Heatmap columns and cells:

<!-- example: examples/HeatmapSegments.svelte -->

```svelte
<script lang="ts">
	import { HeatmapPlot } from '@fundar/data-chart-telling';
	import { PENGUIN_COUNTS } from './datasets';
</script>

<!-- Segments on a heatmap: an outlined column and a filled block of cells. -->
<HeatmapPlot
	width={560}
	height={360}
	data={PENGUIN_COUNTS}
	x="island"
	y="species"
	color="count"
	segments={{
		default: [
			{
				areas: [{ x: { from: 'Biscoe', to: 'Biscoe' } }],
				styles: { stroke: '#f59e0b', strokeWidth: 2 }
			},
			{
				areas: [{ x: { from: 'Dream', to: 'Torgersen' }, y: { from: 'Chinstrap', to: 'Gentoo' } }],
				styles: { fill: '#ef4444', fillOpacity: 0.8 }
			}
		]
	}}
/>
```

<!-- /example -->

![A heatmap with highlighted columns and cells](images/heatmap-segments.png)

Map features, keyed by feature id:

```svelte
<GeoPlot
	{width}
	{height}
	data={provinces}
	featureId={(f) => String(f.properties?.nombre)}
	segments={{
		default: [{ styles: { fillOpacity: 0.7, stroke: '#94a3b8' } }],
		Mendoza: [{ styles: { fill: '#3b82f6', fillOpacity: 0.9 } }],
		Salta: [{ styles: { fill: '#ef4444', fillOpacity: 0.9 } }]
	}}
/>
```

![A map with two highlighted provinces](images/segments-geo.png)

A segment typed with `satisfies SegmentsConfig<LineSegmentStyle>` gets completion for its style fields.
