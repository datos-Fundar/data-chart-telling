# Concepts

## Plots and figures

A **plot** is one graph: axes and marks. Every plot is a component named after what it draws - `LinePlot`, `AreaPlot`, `BarPlot`, `HistogramPlot`, `HeatmapPlot`, `PyramidPlot`, `ScatterPlot`, `GeoPlot` (see [Plots](plots.md)).

A plot is drawn inside a **figure**: the box that holds the plot together with its [chrome](chrome.md) (title, subtitle, legend, timeline, caption). Every plot component is a figure, so a plot with a `title` and a `legend` is still one component. A [`PlotComposer`](composer.md) is a figure that holds several plots.

## Rows and series

A plot draws from one of two data shapes, which are mutually exclusive.

**Flat rows** - `data` plus the field for each channel. The plot groups the rows into series itself:

```svelte
<LinePlot data={rows} x="year" y="value" color="region" {width} {height} />
```

**Pre-built series** - `series`, an array where each series carries its own name, accessors and rows:

```svelte
<LinePlot
	series={[
		{ name: 'North', x: 'year', y: 'value', data: northRows },
		{ name: 'South', x: 'year', y: 'value', data: southRows }
	]}
	{width}
	{height}
/>
```

A series' `name` is what the legend, the value labels and the tooltip show.

## Channels

A **channel** maps a field of each row to a visual property. Each channel takes a field name (`'region'`) or an accessor function (`(d) => d.region`).

| Channel | Maps a row to | Configure with |
| --- | --- | --- |
| `x`, `y` | Position on the horizontal and vertical axis | `scales.x`, `scales.y` |
| `color` | A color: categorical (one per value) or continuous (a ramp) | `scales.color` |
| `grouping` | Which series the row belongs to | `scales.grouping` |
| `opacity` | A fill or stroke opacity | `scales.opacity` |
| `symbol` | A marker shape (categorical) | `scales.symbol` |
| `r` | A dot radius, scaled so that area follows the value | `scales.r` |
| `length` | A vector or spike length | `scales.length` |

`grouping` splits `data` into series. When it is unset, `color` groups too, so one accessor both separates and colors the series - the usual case. Pass both to group by one field and color by another:

```svelte
<ScatterPlot data={rows} x="gdp" y="life" grouping="country" color="temperature" {width} {height} />
```

`r` and `length` also accept a literal number, which is then a fixed pixel size and bypasses the scale.

Details for each channel scale are in [Scales](scales.md).

## Props every plot shares

| Prop | Purpose | Docs |
| --- | --- | --- |
| `width`, `height` | Pixel size of the figure (not needed inside a composer cell) | [Getting started](getting-started.md) |
| `data` / `series` | The rows | above |
| `x`, `y`, `color`, `grouping`, `opacity`, `symbol`, `r`, `length` | Channels | above |
| `scales` | Axis and channel scales | [Scales](scales.md) |
| `styles` | Value labels, frame, gap filling | [Styles and segments](styles-and-segments.md) |
| `segments` | Style ranges of the data | [Styles and segments](styles-and-segments.md) |
| `markers` | Extra marks | [Markers](markers.md) |
| `transforms`, `statistics` | Derive rows before drawing | [Transforms and statistics](transforms-and-statistics.md) |
| `margins` | Space around the plot area | below |
| `tooltip` | Floating tooltip | [Tooltip and hover](tooltip-and-hover.md) |
| `legend` | The legend | [Legend](legend.md) |
| `timeline` | Step through the data by a field | [Timeline](timeline.md) |
| `facet` | Small multiples | [Facets](facets.md) |
| `title`, `subtitle`, `caption`, `header`, `footer`, `order` | Chrome | [Chrome](chrome.md) |

`GeoPlot` takes the same chrome, `tooltip`, `legend`, `styles`, `segments` and `markers`, with GeoJSON in `data` instead of rows and `coordinates` in place of axes (see [Maps](geo.md)).

### Margins

`margins` takes `{ top, right, bottom, left }`. Each side is a number (pixels) or `'auto'`, which fits the side to what is drawn there - tick labels, axis titles, value labels. All sides are `'auto'` by default. `margins` is bindable: `bind:margins` reports the margins the plot settled on.

## What is off until asked for

A plot draws its marks, axes and automatic legend by default. These are switched on by a prop:

| Feature | Switch |
| --- | --- |
| Tooltip | `tooltip` (`true` or an options object) |
| In-plot hover highlight | a `{ type: 'hover' }` marker |
| Value labels | `styles={{ values: { show: true } }}` |
| Toggling series from the legend | `legend={{ series: { interactive: { enabled: true } } }}` |
| A frame around the plot area | `styles={{ frame: true }}` |
| Timeline | `timeline={{ accessor: 'year' }}` |
| Facets | `facet={{ by: 'region' }}` |

## Reading the rest of the docs

Every config object is typed, and each field carries a JSDoc comment. The types exported from the package root (`AxisBasedScalesConfig`, `AxisBasedMarkersConfig`, `LegendSection`, ...) are the exact shapes, and using `satisfies` on a config object gives completion while keeping the literal type.
