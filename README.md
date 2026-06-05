# data-chart-telling

A Svelte 5 component library for building data visualisation charts, built on top of [svelteplot](https://svelteplot.dev). It provides low-level **plot** primitives (single graphs) and will grow to include higher-level **chart** compositions with titles, legends, facets, and timelines.

---

## Build & publish

After making changes, rebuild the package distributable:

```bash
pnpm build
```

`prepack` runs `svelte-package` followed by `publint` automatically before packing, so a publish will always ship a clean build:

```bash
# dry-run — inspect what will be uploaded
pnpm pack

# publish to the npm registry
pnpm publish --access public
```

> Bump `version` in `package.json` before each publish.

---

## Tests

### Unit tests (node)

Pure logic tests — no browser required.

```bash
pnpm test
```

This runs both the **node unit** project and the **browser component** project (Chromium via Playwright).

To run only the node unit tests:

```bash
pnpm vitest run --project=unit
```

To run only the browser component tests:

```bash
pnpm vitest run --project=browser
```

### Storybook interaction tests

Run stories as Vitest tests (requires Storybook to boot internally):

```bash
pnpm test:stories
```

---

## Storybook

Serve the component explorer locally:

```bash
pnpm storybook
# → http://localhost:6006
```

Build a static Storybook for deployment:

```bash
pnpm build-storybook
```

---

## Chart types

> **Vocabulary**: a _plot_ is a single graph (axes + marks). A _chart_ is a plot composition that adds a title, caption, legend, facets, and/or a timeline. Charts are not yet implemented.

### Plots

| Component | Import path | Description |
|---|---|---|
| `LinePlot` | `$lib/plots/line/Plot.svelte` | Line chart. Supports multiple series and optional per-series range segments with independent styles (solid/dashed). |
| `BarPlot` | `$lib/plots/bar/Plot.svelte` | Vertical bar chart. Uses a band scale on X by default. Supports multiple series. |

Both components accept explicit `width` and `height` in pixels (svelteplot does not auto-size).

### LinePlot — segments

Series data is separated from visual styling via the optional `segments` prop — a record keyed by series name:

```svelte
<LinePlot
  {width} {height}
  series={[{ name: 'gdp', x: 'year', y: 'value', data: GDP }]}
  segments={{
    gdp: [
      { to:   2020, style: { stroke: '#4f46e5', strokeWidth: 3 } },
      { from: 2020, style: { stroke: '#4f46e5', strokeDasharray: '6 4' } },
    ],
  }}
/>
```

Omitting `segments` renders the whole series with the CSS custom property `--plot-line-stroke` (falls back to `currentColor`).

---

## Public API

```ts
import {
  LinePlot,
  BarPlot,
  type LineSeries,
  type LineRangeSegment,
  type SegmentsMap,
  type LineSegmentStyle,
  type BarSeries,
  type XValue,
  type YValue,
} from '@fundar/data-chart-telling';
```
