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

```svelte
<LinePlot
	{width}
	{height}
	data={rows}
	x="date"
	y="index"
	color="division"
	styles={{
		values: {
			show: true,
			format: (value, seriesName) => `${seriesName}: ${value.toFixed(0)}`,
			fontStyle: { fontSize: 13 }
		}
	}}
/>
```

![End-of-line value labels](images/styles-values.png)

| Field          | Meaning                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `show`         | Draws the labels. Off by default, except on a heatmap                                                                                          |
| `anchor`       | `'outside'`, `'start'`, `'middle'`, `'end'` - where a label sits on its mark                                                                   |
| `format`       | `(value, seriesName) => string`                                                                                                                |
| `hoverIsolate` | Hovering a label dims every other series                                                                                                       |
| `fontStyle`    | Text style: `fontSize`, `fill`, `dx`, `dy`, `textAnchor`, `lineAnchor`, `rotate`, `class`, ... Overrides the anchor's placement field by field |
| `strokeStyle`  | Style of the connector lines drawn from labels that had to move apart                                                                          |

Where the labels go depends on the plot: the end of each series on a line or area plot, one per bar on a bar, pyramid or histogram, one per point on a scatter, one per cell on a heatmap. On lines, overlapping labels spread apart, share one column and are joined to their points by elbow connectors; the right margin grows to fit them when it is `'auto'`. The spread is tuned by `text.declutter` in the [configuration](theming.md).

### Frame

`styles={{ frame: true }}` draws a border around the plot area; an object restyles it (`stroke`, `fill`, `inset`, `insetTop`, ...).

### Gaps

A row whose value is `null`, `undefined` or `NaN` breaks a line. `styles.gaps` bridges the break with a distinct, interpolated stretch. It is keyed by series name, or `'default'` for the series with no entry of their own, and has three zones: `start` (before the first real point), `middle` and `end` (after the last).

```svelte
<LinePlot
	{width}
	{height}
	series={[{ name: 'female', x: 'year', y: 'value', data: rowsWithHoles }]}
	styles={{
		gaps: {
			default: {
				middle: { interpolate: 'linear', style: { stroke: { strokeDasharray: '4 4' } } },
				start: { x: 2007, style: { stroke: { strokeOpacity: 0.4 } } },
				end: { x: 2023, y: 85 }
			}
		}
	}}
/>
```

![A line bridged across missing values with dashed segments](images/styles-gaps.png)

- `middle` bridges holes between real points, `interpolate` is an easing name (default `'linear'`).
- `start` and `end` reach out to the given `x` (required to fill the zone), landing on `y` there (default: the nearest real value).
- On bar plots only the presence of `x` matters.
- Unset styles fall back to `line.gap`, `bar.gap` and `pyramid.gap` in the [configuration](theming.md).

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
- `'default'` applies to every series; a named key applies to that series only, and wins over `'default'` where both match.
- `legend` names the segment on the automatic [legend](legend.md).

The style shape depends on the plot:

| Plot                        | Style type                         | Fields                                         |
| --------------------------- | ---------------------------------- | ---------------------------------------------- |
| `LinePlot`                  | `LineSegmentStyle`                 | `stroke` (line style), `dots` (dot style)      |
| `AreaPlot`, `HistogramPlot` | `AreaStyle`                        | `fill`, `fillOpacity`, `stroke`, ...           |
| `BarPlot`, `PyramidPlot`    | `BarSegmentStyle` (`AreaStyle`)    | `fill`, `fillOpacity`, `stroke`, ...           |
| `HeatmapPlot`               | `CellSegmentStyle` (`AreaStyle`)   | `fill`, `fillOpacity`, `stroke`, `strokeWidth` |
| `ScatterPlot`               | `ScatterSegmentStyle` (`DotStyle`) | dot fill, stroke, radius, symbol               |
| `GeoPlot`                   | `GeoSegmentStyle`                  | `fill`, `fillOpacity`, `stroke`, `strokeWidth` |

### Examples

A baseline color with a highlighted range:

```svelte
<LinePlot
	{width}
	{height}
	series={[{ name: 'gdp', x: 'year', y: 'value', data: gdp }]}
	segments={{
		gdp: [
			{ styles: { stroke: { stroke: '#94a3b8', strokeWidth: 1 } } },
			{
				areas: [{ x: { from: 2008, to: 2010 } }],
				styles: { stroke: { stroke: '#ef4444', strokeWidth: 3 } }
			}
		]
	}}
/>
```

![A grey line with a highlighted red range](images/segments-highlight.png)

Per-series colors, plus dots over a range shared by every series:

```svelte
<LinePlot
	{width}
	{height}
	data={lifeExpectancy}
	x="year"
	y="value"
	color="sex"
	segments={{
		female: [{ styles: { stroke: { stroke: 'steelblue' } } }],
		male: [{ styles: { stroke: { stroke: 'tomato' } } }],
		default: [
			{
				areas: [{ x: { from: 2010, to: 2012 } }],
				styles: { dots: { dotRadius: 5, dotSymbol: 'circle' } }
			}
		]
	}}
/>
```

![Two series colored individually, with dots on a shared range](images/segments-series.png)

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

```svelte
<HeatmapPlot
	{width}
	{height}
	{data}
	x="quarter"
	y="product"
	color="sales"
	segments={{
		default: [
			{
				areas: [{ x: { from: 'Q1', to: 'Q1' } }, { x: { from: 'Q3', to: 'Q3' } }],
				styles: { stroke: '#f59e0b', strokeWidth: 2 }
			},
			{
				areas: [{ x: { from: 'Q2', to: 'Q2' }, y: { from: 'Alpha', to: 'Beta' } }],
				styles: { fill: '#ef4444', fillOpacity: 0.8 }
			}
		]
	}}
/>
```

![A heatmap with highlighted columns and cells](images/segments-heatmap.png)

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
