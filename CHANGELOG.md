# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Every marker takes handlers for the pointer (`onclick`, `onpointerenter`, `onpointerleave`, `onpointermove`...), called with the event and the row of the shape. They are the props svelteplot documents on all its marks, passed on by every marker that draws one (not `brush`, `hover`, `inset`, `delta` or the map's `features`); svelteplot's code wires them up on `Rect`, `Bar`, `Cell`, `Area`, `Arrow`, `Dot`, `Trail`, `Vector`, `Line`, `Link`, `DelaunayLink` and `Voronoi` so far, and the rest will follow it. `rect`'s `styles.borderRadius` rounds its corners.
- A `text` marker takes the pointer handlers every marker takes (`onclick`, `onpointerenter`...) in place of its own `onPointerEnter` and `onPointerLeave`, which are gone.
- The `styles` of the markers that draw a shape per row - `rect`, `bar`, `cell`, `waffle`, `dot`, `tick`, `rule`, `arrow`, `voronoi` and `delaunayLink`, and `text` for `fill`, `fillOpacity`, `stroke`, `strokeWidth`, `fontWeight` and `fontStyle` - take a function of the row in place of a value: `styles: { fillOpacity: (row) => (row.selected ? 0.55 : 0.12) }`. A string names a field of the rows instead: a number such as `strokeWidth` or `fillOpacity` always, a color when the rows have a field of that name. A color or an opacity a function returns is drawn as it is.

### Changed

- Everything a marker is drawn with now goes in its `styles`, which takes a function of the row for any field: the `stroke`, `strokeWidth` and `strokeOpacity` of `rule` and `arrow` (they took a field key or a function beside `styles`), the `fill` and `fillOpacity` of `text` and the `fill` of `cell`, and the insets - `inset`, `insetLeft`, `insetRight`, `insetTop` and `insetBottom` of `rect`, `bar`, `cell` and `rule`, `inset`, `insetStart` and `insetEnd` of `arrow`. The field keys they took stay, now in `styles`: `styles: { stroke: 'color' }`.

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
