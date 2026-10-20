# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

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
