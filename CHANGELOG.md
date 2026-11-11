# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **`GeoPlot` facets and timeline from one layer of features.** `facet.values` (or a grid's `rowValues` and `colValues`) and `timeline.values` now create their panels and steps though no feature carries the field, so the same features serve every panel with no copy per value. A slice's values are the ones named, in order, then any more found in the features.
- **The slice reaches the callbacks of a `GeoPlot`.** `color`, `opacity`, `grouping`, `featureId` and `styles.onFeatureClick` get `{ facet?: { value, row?, col? }, time? }` as their last argument (empty without `facet` or `timeline`), and a tooltip's `format` has the same `facet` and `time` in its context: `color={(f, { facet }) => valueFor(f, facet?.value)}`. The color ramp spans every panel and step, each read in its own slice, unless `facet.scales` (or `timeline.scales`, with no facet) is `'free'`: then each slice fits its own, and a `grouping` by panel with a `segments` `scales.color` per panel gives each its own scheme - and the legend leaves out the plot's own ramp when every colored feature has one of its own. New type `GeoSliceContext`. See [Maps](docs/geo.md#facets-and-timeline).
- **`useFigure().legend.setRange([min, max] | null, mode?)`.** Narrows an interactive continuous legend from code as dragging its handles does: they move and the plots filter or rescale to the range, in the section's own mode unless one is given. `null`, or a span covering the whole ramp, resets it. For a figure that draws its own mini legends, such as one per map panel, to apply a panel's range to the shared legend. See [Legend](docs/legend.md).

### Fixed

- **`BarPlot` hover on grouped series.** Each series' hover zone now covers only its own strip of the category band, so side-by-side bars report the series under the pointer instead of always the last one.
- **`band` marker on grouped horizontal bars.** A `slice` of a band on `y` is counted from the bottom, as the bars, their hit areas and the hover's dot, text and rule are, so the hover's band lies over the series under the pointer and not the other one.
- **`GeoPlot` hover no longer lays the map out again.** The hovered province is drawn on the plot's projection without joining its scales, so entering or leaving one no longer works out the scales and projection anew - which, with facets and a synced tooltip, was repeated in every panel.
- **Facet grids no longer crawl through a timeline.** A step used to give `FacetLayout` new entry objects, which its each blocks wrote into their items from inside their own effect, and Svelte then walked every derived the write reached, in each panel. The blocks now iterate the panels' keys, and each cell reads its entry from a derived.
- **Shared domains on a stacked, faceted timeline.** With a `timeline` that shows each step's own rows (`filterMode: 'exact'`), a shared value axis was fitted to the rows of every step stacked together. It now reaches the largest total any step stacks in any panel. With `'upTo'` a step shows every row up to it, so the last step's stack still sets it.
- **Docs: horizontal stacked bars use `stackX`.** The bar plot's page, the transforms page and the LLM notes said stacking is always `stackY`, also for horizontal bars. A stack runs along the value axis: `stackY` with values on `y` (vertical bars), `stackX` with values on `x` (horizontal bars); the other makes the category axis numeric and the bars come out empty.

## [1.19.0] - 2026-11-11

### Added

- **Value labels, laid out three ways.** Every plot's `styles.values`, and every marker's `label`, takes a `layout`:
  - `'point'` - beside a point: a line's last value, a scatter's dots, a corner of a bar. `side` (`'after'`, `'before'`, `'above'`, `'below'`, `'on'`) and `gap` place it.
  - `'path'` - along an edge or a stroke: past a bar's tip (its sign followed per bar), along a line or an area's edge, around a dot's rim. `edge`, `side` and `offset` place it, `offset: 'max'` putting it at each curve's peak.
  - `'box'` - inside each shape, fitted to it: a heatmap's cells, a stacked bar's segments.

  Each plot kind keeps its own default and takes only the layouts its shapes can write, checked by its types: `<LinePlot styles={{ values: { layout: 'path' } }} />` writes each series' name along its line. See the new [Value labels](docs/value-labels.md) page and the _Layout/Values_ stories.

- **Labels that stay readable.** On a scatter, labels move clockwise around their dot to the first free spot, and are left out where there is none (`declutter: 'around'`, also on a marker's label or a `text` marker). A value written on its own dot is hidden where a later dot covers it.
- **Several values per row.** `styles.values.parts` picks which values a row writes, typed per plot: a box's or violin's `'min'`, `'p25'`, `'median'`, `'p75'`, `'max'` and `'outliers'`, a bullet's `'target'` and `'ranges'`, a forest's `'lower'` and `'upper'` - as a list, or a record with options for each (`parts: { median: true, max: { format } }`). A label's `format` gets the part in `context.part`.
- **Value labels on `BoxPlot`, `ViolinPlot` and `DensityPlot`.** A box writes its whisker ends and median, a violin its median, a density each curve's name at its peak.
- **More on value labels:** a marker's `label` can be a list; any option of `styles.values` turns the labels on, without `show: true`; `select` and `series` now also pick the labelled rows of bar, histogram, heatmap and scatter plots.
- **A generic `Plot`** that draws only its `markers`, with every option a plot takes, for annotations and custom compositions: `<Plot markers={[{ type: 'density', data, x: 'gdp', y: 'life' }]} />`.
- **Markers inherit from their plot** the position and channels they leave unset (`x`, `y`, `opacity`, `symbol`, `r`, `length`, with their scales), and run horizontally or vertically by their own channels when the plot has none.

### Changed

- **Breaking:** `styles.values.anchor` is replaced by `layout` and its options. On a line plot, `'start'` is now `side: 'after'` (the default), `'end'` is `side: 'before'`, `'outside'` is `side: 'above'`, `'middle'` is `side: 'on'`. On a bar plot, `'outside'` is the default, `'tip'` and `'base'` are `{ layout: 'path', edge: 'tip' | 'base', side: 'inside' }`, and `'middle'` or a page edge is `{ layout: 'box', anchor }`.
- **Breaking:** `styles.values.fontStyle` only styles the text: `dx`, `dy`, `textAnchor` and `lineAnchor` are gone, the layout places it (`fontStyle: { dy: -12 }` is `gap: 12`).
- **Breaking:** a shape label's `outside` is gone: `{ anchor: 'top', outside: true }` is `{ layout: 'path', edge: 'top' }`.
- **Breaking:** the plot shell exported as `Plot` (to build your own plot kinds) is now `AbstractPlot`; `Plot` is the new generic plot.
- A scatter's value labels sit above their dots by default, and no longer overlap.

### Fixed

- `styles.values.color` now colors the labels of bar, pyramid, histogram and scatter plots.
- A violin plot colored by its category draws each violin centered in its band, instead of side by side with empty slots.
- The x axis title no longer lands on the tick labels when value labels grow the plot's margins.
- A label along a line, near one of its ends, is no longer cut short.
- **Hovering no longer lays the whole plot out again at every move of the pointer.** svelteplot works a plot's scales out from every mark's rows, and the hover changed them at each move: its dots, rules and values came and went as marks of the plot, the `active` and `others` styles split a marker's rows anew, and a mark copied its rows whenever one of their styles changed. Each move rebuilt every scale from every row, scaled every mark again and measured the margins again, more so the more series, rows and synced panels a plot has. Now the hover's `back` and `front` markers are drawn on the plot's scales without taking part in them, a marker the hover restyles stays whole with each style read off the row as it is hovered, and the plot works its scales out again only when a mark's rows hold something new. A move of the pointer over a fifteen-line plot settles in about a quarter of the time, and over a treemap or a heatmap that restyles its shapes in a tenth to a quarter.
- The outline the `hover` marker's `active` gives the hovered shapes (its `stroke`, `strokeWidth`, `strokeOpacity` and `strokeDasharray`, the plot's own `hover.active` by default) is drawn whole, over every shape of the plot. It was drawn on the shape itself, in its marker's order, so the tiles of a treemap, the cells of a heatmap with no gap or the bars of a plot drawn after it covered part of it. The outline never takes the pointer from the shape under it.

## [1.18.0] - 2026-11-09

### Added

- A `band` marker: the band of a category on a band scale, across the whole of the other axis - `{ type: 'band', axis: 'x', value: 'Salta' }`. `value` is a category or a list of them, or with `data` a field key or a function of the row; rows that name the same category draw one band. `slice` fills part of it, as the fractions of its width left out at each end (a grouped bar's series), and a band several rows share fills what all of their slices do. `styles` take `AreaStyle`, each field a value or a function of the row, over the configuration's new `band` (`{ fill: '#94a3b8', fillOpacity: 0.25 }`). It takes the pointer only with a handler of its own, and draws nothing on an axis that is not a band scale.
- The `hover` marker's `active` and `others` restyle the shapes themselves: the ones the hover matches (by its `strategy`) take `active`, every other one `others`, while the hover is on - `fill`, `fillOpacity`, `stroke`, `strokeWidth`, `strokeOpacity` and `strokeDasharray`, each a value or a function of the row. `markers={[{ type: 'hover', active: { fillOpacity: 1 }, others: { fillOpacity: 0.3 } }]}` lightens the hovered tile of a `TreemapPlot` and fades the rest, and does the same on the cells of a `HeatmapPlot`, the bars of a `BarPlot`, a `BulletPlot` and a `PyramidPlot`, a `HistogramPlot`'s bins, a `ScatterPlot`'s dots and the dots of the Cleveland family, whose own shapes are linked to the hover. On a dot they are its `dotFill`, `dotStroke`... The shape is restyled, not covered: its label stays on top, and one with no `fill` of its own is written in the color that reads best on the new one. They go over `styles` and `segments`; a series the legend dims keeps its dimmed fill and opacities.
- The `hover` marker's `back` and `front`: the markers it draws behind the plot's shapes and in front of them - any marker but another `hover`, a `component` too, with its styles and events. They draw the hovered points, each a row with its `x`, `y`, `label` (written as the marker's number fields or `format` ask), `series`, `color`, `areaInset` and `row`, unless they have `data` of their own, and what they leave unset comes from the hover: `x` and `y`, a `rule`'s and a `band`'s `value` (and a band's `slice`), a `text`'s `text`, the configuration's `hover` look (`rule`, `dot`, `font`, `area`) and the series color of a `dot` and a `text`. `points: 'active'` draws only the point under the pointer, and a function of the point some of them. On a grouped bar plot each is drawn in its series' slice of the band.
- Each plot kind has a hover of its own that an author's `hover` marker is laid over: `active` and `others` field by field, `back` and `front` replaced when set (`back: []` draws nothing behind). `LinePlot`, `AreaPlot` and `DensityPlot` draw a crosshair along each axis their strategy matches along, and a dot and the value on each point, as the marker did; `ScatterPlot` a crosshair through the point and its value; `SlopePlot` and the Cleveland family (`ClevelandPlot`, `DumbbellPlot`, `ForestPlot`, `LollipopPlot`) a rule along the value axis, a dot and the value; `BarPlot`, `BulletPlot`, `BoxPlot`, `ViolinPlot` and `PyramidPlot` the hovered category's band behind their shapes; `HistogramPlot` the hovered bin's span; `SparklinePlot` a dot; `TreemapPlot` and `HeatmapPlot` only outline the hovered tile or cell, in the configuration's new `hover.active` (`{ stroke: '#111827', strokeWidth: 2 }`).
- The hover's point under the pointer is the one nearest it of those the hover reaches: a crosshair at it, and `points: 'active'`, follow the pointer up and down a category from one series' point to another's.
- A row context: what a plot knows of each row it draws, worked out once as it reads its data and kept on the row - its `series`, its `x` and `y` (its own values, not a stack's running total, else where the transforms put it), the `value` it shows, the `row` itself, and what the plot kind works out for it: a `TreemapPlot` tile's `name`, `path` and `share`; a `HistogramPlot` bin's `count`, `from` and `to`; a `BoxPlot` or `ViolinPlot` value's box (`category`, `min`, `p25`, `median`, `p75`, `max`, `count`, `outliers`); a `DensityPlot` point's estimate as its `value`; a `HeatmapPlot` cell's color value. `tooltip.format`, `styles.values.format`, the `hover` marker's points (`point.context`, in its `format` and its `back` and `front` markers) and `usePlot().contextOf(row)` all read it, and `RowContext.of(row)` reads it anywhere, from a row or a copy of it. A plot kind adds its own with a `context` function in its defaults. `PlotRowContext`, `KindRowContext`, `TreemapRowContext`, `HistogramRowContext` and `BoxRowContext` are exported.
- A `DensityPlot`'s hovered point and its tooltip read as its estimated density, with three decimals.
- What a plot's hover draws follows the strategy in force as it is shown: a composer's `hover.strategy` changed while the plot is on screen (a scrolly step) changes the crosshair it draws.
- A marker's `hover` takes `'trigger'` (a hit area of the plot's hover, what `true` was) and `'style'` (its shapes take the hover marker's `active` and `others`); `true` does both. `HoverMarkerConfig`, `HoverShapeStyle` and `HoverLayerMarker` are exported.
- `examples/TreemapHover.svelte`, a _Configuration / State_ story reading a histogram's row context, and a `Layout/Hover` section of stories: each plot kind's own hover, the strategies (one changed while a plot is shown), the number fields, the scope, `active` and `others`, `back` and `front`.

### Changed

- **Breaking:** `styles.values.format` is `(value, number, context)`, as a tooltip's `format`: the series is `context.series`, the labelled row `context.row`. `format: (v, name) => `${name}: ${v}`` is `format: (v, _number, { series }) => `${series}: ${v}``.
- **Breaking:** a `HistogramPlot`'s tooltip rows are its bins as they are, without the `count`, `from`, `to` and `group` they had: those are in the `context`, a `tooltip.format`'s third argument (`group` is `series`).
- A tooltip's `context` holds the row's `x`, `y`, `value` and `row` along with its `series`, and a `TreemapPlot`'s the tile's `name`, `path` and `value` along with its `share`. `TreemapTooltipContext` is `TreemapRowContext`.
- **Breaking:** the `hover` marker's `ruleX`, `ruleY`, `areaX`, `areaY`, `showLabels`, `rule`, `area`, `dot` and `text` are gone: what it draws is its `back` and `front` markers. `ruleX: false` is `back: []`; `ruleY: true` a `{ type: 'rule', axis: 'y', points: 'active' }` in `back`; `areaX: true` a `{ type: 'band', axis: 'x' }` in `back`; `showLabels: false` is `front: [{ type: 'dot' }]`; `rule`, `area`, `dot` and `text` are the `styles` of those markers. `text.textAnchor: 'outside'` is two `text` markers, each kept to one side of zero by `points`. On every plot but `LinePlot`, `AreaPlot` and `DensityPlot`, `{ type: 'hover' }` draws something else than the crosshair, dot and label it drew: see the hover each plot kind has of its own, above.
- A marker with `hover: true` (or `'trigger'`) hovers the row of the shape under the pointer, not the first of its rows.
- A series the legend dims (`mode: 'dim'`) stays hoverable: it is matched and shows in the tooltip. Only one it hides, omits or rescales away is out of the hover.

## [1.17.0] - 2026-11-06

### Added

- A `rect`, `cell`, `bar` or `waffle` marker takes a `label`: a text in the middle of each shape, with every option of a `text` marker, fitted to the shape - written smaller, down to `minFontSize`; then cut short with an ellipsis on as many lines as it holds; then as its `fallback`, a value alone, say; and left out when nothing fits. It takes no pointer from the shape, unless it has a handler of its own. `anchor` puts it against an edge or in a corner, and `outside` beyond the edge, where `fitMargins` makes room for it. A `text` marker takes the same `fit`, with a box of its own.
- A `treemap` transform, for a `rect` marker on any plot kind: it lays the rows out as tiles in the unit square with d3-hierarchy - a tile per distinct path of `levels`, its area the sum of its rows' `value` - and gives `x1`/`x2`/`y1`/`y2` (and `x`/`y` at each tile's centre for a `text`). `tile` picks how a rectangle is split (`'squarify'`, `'binary'`, `'slice'`, `'dice'`, `'sliceDice'`) and `aspect` the shape of the box the tiles fill.
- Every marker takes handlers for the pointer (`onclick`, `onpointerenter`, `onpointerleave`, `onpointermove`...), called with the event and the row of the shape. They are the props svelteplot documents on all its marks, passed on by every marker that draws one (not `brush`, `hover`, `inset`, `delta` or the map's `features`); svelteplot's code wires them up on `Rect`, `Bar`, `Cell`, `Area`, `Arrow`, `Dot`, `Trail`, `Vector`, `Line`, `Link`, `DelaunayLink` and `Voronoi` so far, and the rest will follow it. `rect`'s `styles.borderRadius` rounds its corners.
- A `text` marker takes the pointer handlers every marker takes (`onclick`, `onpointerenter`...) in place of its own `onPointerEnter` and `onPointerLeave`, which are gone.
- The `styles` of the markers that draw a shape per row - `rect`, `bar`, `cell`, `waffle`, `dot`, `tick`, `rule`, `arrow`, `voronoi` and `delaunayLink`, and `text` for `fill`, `fillOpacity`, `stroke`, `strokeWidth`, `fontWeight` and `fontStyle` - take a function of the row in place of a value: `styles: { fillOpacity: (row) => (row.selected ? 0.55 : 0.12) }`. A string names a field of the rows instead: a number such as `strokeWidth` or `fillOpacity` always, a color when the rows have a field of that name. A color or an opacity a function returns is drawn as it is.
- `TreemapPlot`: a tile per row, its area its `value`, nested by `grouping` and laid out with `d3-hierarchy` (a `treemap` entry in `transforms` sets `tile`: `'squarify'`, `'binary'`, `'slice'`, `'dice'` or `'sliceDice'`). `grouping` is the whole path of a tile (`'sector.branch'`) (the last level names it, rows with the same path are one tile, so `grouping: 'sector'` alone is a tile per sector) and its outermost level colors the tiles and fills the legend. The tiles are the `treemap` transform drawn as `rect` markers with a `label`. `segments` can be keyed by the path of a tile (`'Tertiary.Finance'`), the most specific winning, and `tooltip.format(row, number, context)` gets the tile's `share` (0 to 100) in its `context`. A tile is labelled with its name over its share of the whole, as `styles.values` asks, and the label is fitted to the tile: at a smaller font size first, then the name cut short with an ellipsis, then the share alone, then nothing. Hovering a tile matches it alone. `treemap` in the configuration sets the line between tiles and the label's color, size and room.
- `grouping` takes fields joined by dots (`'region.sex'`): the levels of one grouping, outermost first. A plot that nests its rows (`TreemapPlot`) nests by them; any other splits its rows by the combination of the levels, a series named `'CABA.F'`. A dotted name is a field when the rows have one by that name.
- `DataProps` is now `DualAxisDataProps`, one of a family by the axes a plot has: `SingleAxisDataProps` (`x` or `y` alone, a histogram's or a density's) and `NonAxisDataProps` (no position channels, a treemap's), which the other two extend. Each takes the channels a plot cannot draw without as a second parameter.
- `scales.color.depth`: with a `grouping` of several levels, the level the colors reach - each outermost value keeps its categorical color and the values under it, down to that level, take tones of it. A treemap colors its tiles so, and any other plot the series it splits by every level. `ColorTones` (`colorTones`, `hierarchicalColors`) builds the tones, for any plot of a hierarchy.
- A legend's `disabled: { mode: 'rescale' }`: the series is removed and the parts left of a whole are the new 100% - a stack's categories are scaled back up to their totals, a treemap's tiles laid out and given their shares anew. `'omit'` now leaves a treemap's other tiles in their place and with their share of the whole.
- The legend makes words of each level of a series grouped by several (`'Americas.Argentina'`).
- A `value` channel: what a row amounts to as a part of a whole. `TreemapPlot` sizes its tiles by it; the other plots ignore it.
- `tooltip.format` gets a third argument, `context`: what the plot knows of the row beyond its fields - its `series`, and what its kind adds (a treemap's `share`).
- A marker's `strokeDasharray` takes a named line style - `'solid'`, `'dashed'`, `'dotted'`, `'dashdot'` - as well as an SVG dash pattern.
- Every marker takes `hover: true`, which makes it a hit area of the plot's hover: the pointer over any of its shapes hovers its rows.
- A label inside its shape (`rect`, `cell`, `bar`, `waffle`, and the value labels of every plot written in a shape) with no `fill` of its own is written in the color that reads best on the shape, as it is seen - blended with the plot's background as far as its `fillOpacity` lets it through. It picks from the configuration's new `text.label.contrast` (`['#ffffff', '#111827']`), and takes white or black instead when neither reaches WCAG AA (4.5:1).
- `CssColor.alpha` and `CssColor.composite`: a color's opacity, and the opaque color it is seen as over a backdrop. `CssColor.contrastText` (and `contrastTextColor`) takes a `minRatio`, WCAG AA by default.

### Changed

- **Breaking:** `continuous.labelColor` and the `--dct-heat-text`, `--dct-heat-min` and `--dct-heat-max` CSS variables are gone: a heatmap's value labels contrast with each cell (`text.label.contrast`), and its ramp is the default continuous one, `continuous.min`/`max` or `continuous.scheme`, set with `setConfiguration`. No style read the variables.
- The configuration's `--dct-*` CSS variables are set once on the document root (`:where(:root)`), not on each figure, so a variable set on a wrapping element overrides them, as the theming docs say. `cssVarsRule` writes them as that rule.
- The axes, and what a plot writes in their ink (value labels outside their shape, a violin's box, a bullet's target, a Cleveland connector, a map's outlines), take `--dct-axis-color`; the timeline's current step takes `--dct-timeline-active`. Both fall back to the configuration.
- `CssColor.contrastText` never returns a candidate under its `minRatio` (WCAG AA, 4.5:1) when white or black does better, and its luminance follows sRGB's own threshold (0.04045).
- The value labels of `BarPlot`, `BulletPlot`, `PyramidPlot`, `HistogramPlot` and `HeatmapPlot` are the `label` of their own shapes (`bar`, `rect`, `cell`), so they fit them: a label that does not fit is written smaller, cut short, or left out. On those plots `styles.values.anchor` takes the anchors of a shape's label - `'middle'`, `'top'`, `'bottom'`, `'left'`, `'right'`, the corners (`'top-left'`...), and `'tip'` and `'base'`, the end of a bar away from zero and the one on it, on either side of zero - and `'outside'`, beyond the tip, which stays the default. `'start'` and `'end'` are gone from them (they were the top and bottom of the page, or the left and right, whatever the sign); the plots that label a point or the end of a line keep them. `fontStyle.dx` and `dy` now push a label from its anchor rather than replace its gap. A label with `hoverIsolate` still dims the other series and a dimmed series dims its labels. `LabelAnchor` is one type for the anchors of a text marker's `frameAnchor`, a shape's `label` and the plots' `anchor`.

- Everything a marker is drawn with now goes in its `styles`, which takes a function of the row for any field: the `stroke`, `strokeWidth` and `strokeOpacity` of `rule` and `arrow` (they took a field key or a function beside `styles`), the `fill` and `fillOpacity` of `text` and the `fill` of `cell`, and the insets - `inset`, `insetLeft`, `insetRight`, `insetTop` and `insetBottom` of `rect`, `bar`, `cell` and `rule`, `inset`, `insetStart` and `insetEnd` of `arrow`. The field keys they took stay, now in `styles`: `styles: { stroke: 'color' }`.

## [1.16.0] - 2026-11-04

### Fixed

- A timeline tweened with `interpolate` is at its last step once `progress` comes within `timeline.snap` (default `1e-4`, a ten-thousandth of the span; `0` turns it off) of it. A scrubber that stops a hair short of `1` - a scrolled step ends at `0.97` - drew the line all the way to the end with its easing, but left out the last row: its dot, and a marker like a `delta` placed on it.

## [1.15.0] - 2026-11-04

### Fixed

- A bar plot's value labels follow the bars that go below zero (or left of it): `'outside'` puts a label beyond its bar's tip on that side - to the left of a horizontal bar, under a vertical one - and the plot's margins make room for it. On a horizontal bar `'start'` is its left end and `'end'` its right one, both inside, and `'middle'` is its centre (it sat on the tip); a vertical bar's anchors are as they were.

### Changed

- On a line, the piece that joins two runs of a series is drawn as the first area segment that covers both of its ends - so a dashed projection that starts at the last observed year dashes the piece leaving that year, even where a faded range that ends there owns the point. It was always the catch-all's stroke, which left a solid piece at the start of the projection. A piece no area covers both ends of keeps the catch-all's stroke.

## [1.14.0] - 2026-11-04

### Added

- The `hover` marker takes `decimals`, `prefix`, `suffix` and `signDisplay` for its label, and its `format` gets a second argument, `number`, that writes a value as they ask. With `numbers.decimals` set, its label is written with that count.
- The `format` of `styles.values` gets `number` as its fourth argument, to write a value as the display fields ask while choosing which labels to show.
- The `continuous` and `size` legend sections (so `legend.color` too) take `decimals`, `prefix`, `suffix` and `signDisplay` for their values - without `decimals` they keep the axes' format, and `numbers.decimals` does not reach them. Their `format` gets `number` as a second argument, and can return a number (`v * 100` for a share kept as a ratio), which is written as those fields ask.
- A `delta`'s `formatDiff` can return a number: it is written as the marker's display fields ask.

## [1.13.0] - 2026-11-04

### Added

- `decimals`, `prefix`, `suffix` and `signDisplay` (`'auto'`, `'always'` or `'never'`) write the numbers a plot shows, in `axis.locale`: on `scales.x` and `scales.y` (the ticks), `tooltip`, `styles.values` (value labels), and the `text` and `delta` markers. `'always'` writes a plus on positives, never on zero. `numbers.decimals` in the configuration sets the count everywhere but the ticks, which keep their automatic format unless `scales` sets `decimals`. A tooltip writes the value on the plot's value axis - the `x` of horizontal bars, not only the `y` - and a heatmap's color value.
- A `text` marker's `text` can be a number, the name of a numeric field of the rows, or a function giving a number, besides a string: a number is written as the marker's display fields ask.
- A tooltip's `format` gets a second argument, `number`, that writes a number as the tooltip's display fields ask. The `format` of a plot kind's value labels (`ValueLabelsOptions.format`) gets it too.

### Changed

- The `continuous` and `size` legend sections (so `legend.color` too) take `decimals`, `prefix`, `suffix` and `signDisplay` for their values - without `decimals` they keep the axes' format, and `numbers.decimals` does not reach them. Their `format` gets `number` as a second argument, and can return a number (`v * 100` for a share kept as a ratio), which is written as those fields ask.
- A `delta` writes its distance in `axis.locale` (`12,3`), not with a dot (`12.3`), and with the configuration's `numbers.decimals` when set. One decimal remains the default.

## [1.12.0] - 2026-11-04

### Added

- `labels` on a discrete legend section (`legend.series.labels`, or on an explicit section): `prefix`, `suffix` and `replace` rewrite the label of every item - to add a unit (`' years'`) or shorten a word (`{ Quintile: 'Q' }`, or `[[/^Quartile /, 'Q: ']]`) - without removing the automatic items to write them again. The names are left as they are, so turning series off still goes by them.

## [1.11.0] - 2026-11-04

### Changed

- The dots of a `delta` take the color of the series their end measures, as the plot draws it. Before, they took the line's `stroke` and, with none set, a neutral color. The line's `stroke` still wins when it is set, and the delta's own `dot` wins over both; an end on an axis keeps the neutral color. `usePlot()` now also gives `colorForSeries`.
- **Breaking:** a delta's line is styled with `stroke`, not `line`, like the rest of the styles (`DeltaMarkerConfig.line`, also as a function of the position). Rename it where it is set.

## [1.10.0] - 2026-11-03

### Added

- `styles.stroke`, `styles.dot` and `styles.area` on every axis-based plot: the style every series is drawn with, each as it is or as a function of the series' name. A plot uses the ones its own marks are made of and ignores the rest: `stroke` and `dot` on `LinePlot`, `SlopePlot`, `SparklinePlot` and the plots with connectors (`LollipopPlot`, `DumbbellPlot`, `ClevelandPlot`, `ForestPlot`); `area` on `AreaPlot`, `BarPlot`, `BulletPlot`, `PyramidPlot`, `HistogramPlot`, `BoxPlot`, `DensityPlot`, `ViolinPlot` and `HeatmapPlot`; `dot` on `ScatterPlot`. A segment's own style wins over them field by field, a connector styled with `styles.connector` wins over `styles.stroke`, and the connectors of those plots - and their arrows - take its dashes and line caps and joins (`strokeDasharray`, `strokeLinecap`, `strokeLinejoin`) from it or from a segment, and a series a legend turned off dims over all of them. Before, restyling every series - or one of them - took a `segments` entry per series.

### Fixed

- The outline an area style sets - `stroke`, `strokeWidth`, `strokeOpacity`, `strokeDasharray` and `borderRadius` - reaches the bars of `BarPlot`, `BulletPlot` and `PyramidPlot` and the bins of `HistogramPlot`, whether it comes from a segment or from `styles.area`. These plots read only the fill of a segment's style, so the rest was ignored; a series a legend dims fades its outline with its fill.

### Changed

- **Breaking:** the dots of a line's style are `dot`, not `dots`, so they read like `styles.dot`: `LineSegmentStyle.dots` (in `segments` and in the `styles.gaps` zones), the legend's `LegendDisabledStyle.dots` and `line.gap.dots` in the configuration. Rename them where they are set.

## [1.9.0] - 2026-11-03

### Changed

- A continuous legend no longer lets its labels touch. Its edge labels (the two ends of the domain) are always written; a tick label is left out, with its mark, when it comes within `legend.continuous.label.overlap.margin` px of an edge label or of a tick before it (weighed from the low end up). Before, a tick near an end was written over it.
- In the interactive continuous legend, handle labels that meet no longer turn vertical: the label of the handle that rests on the domain's end is hidden, and the moving one stays horizontal and writes both values (`18% – 20%`) until they part. That label follows its handle but is kept inside the legend's width. If both or neither rest on an end, the one moved last stays.

- `legend.continuous.label.weight` (`--dct-continuous-label-weight`) styles every label of a continuous legend - the edges, the ticks and the interactive handles - and defaults to `400`. It styled only the handle labels, at `600`, so an interactive legend wrote its values in bold and a plain one did not. Set it to `600` to keep the old look of the handles.

### Removed

- `legend.continuous.label.overlap.rotate` and its CSS variable `--dct-continuous-label-overlap-rotate`: there is no vertical label to rotate any more. `overlap.enabled` and `overlap.margin` stay, and now govern both behaviours above.

## [1.8.1] - 2026-11-02

### Fixed

- `styles.values.format` gets the labelled row as its third argument on `BarPlot`, `PyramidPlot`, `HistogramPlot`, `ScatterPlot` and the end-of-line labels of `LinePlot` and `AreaPlot`, as its documentation says; only `ClevelandPlot` did. A format that returns no text for some rows - the only way to label some pieces of a stacked bar and not others - had no row to decide by.

## [1.8.0] - 2026-11-02

### Added

- `scales.x.lines` and `scales.y.lines` write each label of a category axis on up to that many lines, split at its spaces so the lines are as even as they can be, and keep the `x` labels upright instead of turning them. A `tickFormat` is applied first.
- A band `y` axis whose `scales.y.tickFormat` gives a label on several lines (a list of strings, or a text with line breaks) writes it on those lines, and its left margin grows to the widest one. svelteplot's own axis joined the lines with spaces, so only the `x` axis could wrap its labels.

## [1.7.0] - 2026-11-02

### Added

- `legend.removeItems` leaves automatic items out of the series section by name: a series, or a segment or marker that names itself. A plot that colors its marks through `segments` with a `legend` of their own can list only those, without the one series they come from.

## [1.6.1] - 2026-11-02

### Fixed

- The `continuous` and `size` legend sections (so `legend.color` too) take `decimals`, `prefix`, `suffix` and `signDisplay` for their values - without `decimals` they keep the axes' format, and `numbers.decimals` does not reach them. Their `format` gets `number` as a second argument, and can return a number (`v * 100` for a share kept as a ratio), which is written as those fields ask.
- A `delta` marker at a `Date` position no longer turns a date `x` axis into a numeric one: it drew its dots, line and label at the position as a number, which svelteplot read next to the dates of the data as a linear scale, and the axis showed milliseconds.

## [1.6.0] - 2026-11-02

### Added

- Every legend section takes `enabled`, on unless set: `legend: { series: { enabled: false } }` leaves the series section off the automatic legend, and `color`, `opacity`, `r` and `symbol` (with a `match`, to pick one of several) do the same for theirs. A section added through `legend.sections` takes it too.

## [1.5.0] - 2026-10-31

### Changed

- Zooming or panning a map no longer re-projects every feature on each wheel tick or drag move. The features already drawn are carried to the new view with an SVG transform and the projection is moved, and the features redrawn, once the view has been still for 120 ms. A map of 6,000 features goes from about 340 ms to about 50 ms per wheel tick. Strokes and dots are briefly scaled while the view moves.

### Fixed

- A series' catch-all segments that name different facets, or a facet next to the unscoped one, no longer log the warning for two catch-alls: they do not compete.

## [1.4.0] - 2026-10-30

### Added

- `legend.off` in the automatic legend's configuration turns series off from code, as if the reader had clicked them: a list of names (dimmed), or a map to an opacity or to a `dim`, `hide` or `omit` action; a series left out is turned back on. `legend.highlight` is its inverse, keeping the series it names and dimming the rest. A plot with facets can dim a series exactly when no panel shows it.

### Fixed

- Value labels that fit margins measure what reaches past the plot against the area svelteplot lays the plot out by, not against the estimate an `'auto'` margin has until its axes are sized. A label inside the plot could read as overflow in that moment and grow the margins for good, so the same plot drew with different margins from one render to the next.

## [1.3.0] - 2026-10-30

### Added

- `legend.icon` in the configuration sets the icon a discrete legend item draws for its series: `rounded` softens its corners, and `marks` picks the shape by how the series draws (`line`, `dot`, `area`, `bar`, `cell`, `rect` or `geo`), unless the series sets its own `symbol`. A legend item can name its `mark` to choose from it.
- A `rule` marker takes a list as its `value`, and a `delta` marker a list as its `at`: one line, or one delta, at each position, all with the same style, instead of one marker for each. A delta's `line`, `text` and `dot` can be functions of the position, to style each one on its own.
- `facet` on a marker or a segment limits it to some facet panels, on every plot kind: a `by` value, a list of them, or `{ row, col }` in a `rows`/`cols` grid. Without it a marker or a segment is drawn in every panel, as before, and a plot with no facet leaves out whatever names one.

### Fixed

- Automatic margins reserve what a plot needs without taking its drawing area: the label of the top y tick is no longer cut off, since an `'auto'` top margin now leaves room for half its height, and margins that grow to fit labels stop growing once they would leave the plot less than a quarter of its box, which kept svelteplot from drawing marks with negative sizes on small plots.

## [1.2.0] - 2026-10-24

### Added

- `LollipopPlot`, a dot on a stem for the value of each category.
- `DumbbellPlot`, two series joined by a connector for each category.
- `ClevelandPlot`, any number of series per category joined from the lowest to the highest value, with connectors you can color, turn into arrows and sort by series value or range.
- `ForestPlot`, a dot per row on a stem spanning its confidence interval.
- `BulletPlot`, a bar against a target tick and shaded qualitative ranges.
- `SlopePlot`, the change of each series between two moments, labelled at both ends.
- `SparklinePlot`, a small axisless line with a dot and a label on its last point.
- `DensityPlot`, a kernel density curve of one numeric field, and `ViolinPlot`, the mirrored density of each category with a box inside.
- Step lines through `styles.curve: 'step'`, `'step-after'` or `'step-before'` on `LinePlot`.
- A `deviation` statistic that draws an estimator of the values and a band around it, with optional labels.
- `styles.values.select` chooses which points get a value label (`'first'`, `'last'`, `'min'`, `'max'` or a list), for line, area and Cleveland-family plots.
- The size channel (`r`) works on the dots of the Cleveland family, and its automatic legend is configured under the `r` key.
- Every marker takes `dx` and `dy` to move it a number of pixels, on a map too, and `dot`, `text` and `image` markers also take a function of the row to move each row on its own.
- `setConfiguration({ palette })` takes the name of a d3-scale-chromatic scheme (`'viridis'`, `'dark2'`...) or `{ scheme, count, schemeRange }` instead of just a list of colors.
- `continuous.scheme` and `continuous.schemeRange` in the configuration set the default continuous ramp by the name of a d3-scale-chromatic ramp, as an alternative to its `min` and `max` colors.
- Tick labels turn or thin out on small plots when they would not fit, and the last label of an axis that is not rounded to nice values stays inside the plot.
- A timeline can free one axis at a time (`scales: 'free-x'` or `'free-y'`) while the other keeps its shared domain.
- `link` markers on a map can lift their arcs off the surface (`altitude`) and cut them where a globe hides them (`occlusion`).

### Changed

- The default palette is Tableau 10, and the default continuous ramp, the timeline and player accents and the connector colors follow it.
- Plots draw faster: a plot in a facet, a grid or a composer no longer remounts its svelteplot chart each time the margins its labels need settle after mount. `pnpm test:perf` checks that every plot kind draws all the panels of a facet grid within a time budget; it runs before a push but not in CI, where the speed of the machine makes a time limit flaky.

### Fixed

- The example datasets moved out of the stories into `examples/datasets`, where real data replaces the synthetic rows and the docs, examples and stories all read the same files.
- The Minard map of Napoleon's march is rebuilt with `GeoPlot` and `LinePlot` markers instead of a hand-assembled svelteplot chart.

## [1.1.0] - 2026-10-20

### Added

- `BoxPlot`, a new plot kind for the distribution of values per category. It draws one box per category of each series: the quartiles, the median, whiskers that reach the farthest values within 1.5 times the interquartile range, and the values past them as outlier dots.
  - Boxes stand upright when the categories are on `x` and lie sideways when they are on `y`.
  - `grouping` or `color` gives each group its own box and color, and `facet` compares groups in separate panels.
  - The tooltip reads one box at a time instead of every value inside it. The hovered row carries `category`, `min`, `p25`, `median`, `p75`, `max`, `count` and `outliers` for a custom `format`.
  - Categories keep the order the data gives them, and the value axis fits the values without reaching for zero.
  - It takes the same props as every other plot: `segments` to restyle whole categories, the interactive legend, `markers`, `styles.frame` and the rest.
  - New `box` block in the configuration for the box fill opacity and the spacing between boxes (`fillOpacity`, `paddingInner`, `paddingOuter`).

### Fixed

- Nice axis domains no longer grow a whole extra step when the data ends just past a round value (parts that sum to `100.00000000000001` stay on `100`). `niceTolerance` on a scale sets how far past a tick, as a share of the step, the data may end and still stay on it.
- Ticks at the data's first and last values no longer crowd the nice tick next to them. `axis.edgeTicks` in the configuration (or `edgeTicks` on a scale) chooses what happens then: `collision` is `'drop-nice'`, `'drop-edge'` or `'extend'`.
- A tooltip that lists several rows shows them highest value first.
- The timeline accepts steps given as `Date` objects or date strings (ISO, or any pattern set with `dateFormat`), not only numbers.
- The `delta` marker's label offset and anchor have defaults per axis in the configuration (`delta.text`).
- Documentation and examples brought up to date with the current API.

## [1.0.0] - 2026-10-16

First stable release.

### Added

- Plot components for line, area, bar, histogram, heatmap, pyramid, scatter and geographic maps, built on svelteplot and sharing one vocabulary of channels, scales, styles, segments, markers, transforms, tooltip, legend, timeline and facet props.
- A plot shell that carries its own title, legend, tooltip, facets and timeline, plus a composer for combining plots (instead of using a separate Chart component).
- Transforms (stack, bin, window) and statistics such as regression.
- Interactive legends, a timeline player and rule, and synced hover across plots.
- A global theme.
- Documentation, runnable examples and `llms.txt` / `llms-full.txt` for LLM use.
- Unit and real-browser test suites, Storybook stories, and CI with CodeQL on GitHub Actions.
