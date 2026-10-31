# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

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
