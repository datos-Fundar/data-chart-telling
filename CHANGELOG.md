# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

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
