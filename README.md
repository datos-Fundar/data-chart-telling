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

> **Vocabulary**: a _plot_ is a single graph (axes + marks). A _chart_ wraps a plot with a title, caption, legend, facets, and/or a timeline.

### Charts

| Component | Import path | Description |
| --- | --- | --- |
| `BarChart` | `$lib/charts/bar/Chart.svelte` | Vertical bar chart with title/caption/legend/facet/timeline chrome. |
| `HeatmapChart` | `$lib/charts/heatmap/Chart.svelte` | Grid of colour-coded cells. Colour domain is computed over the full dataset for cross-facet comparability. |
| `LineChart` | `$lib/charts/line/Chart.svelte` | Line chart. Default timeline mode is `upTo` (cumulative reveal). |
| `PyramidChart` | `$lib/charts/pyramid/Chart.svelte` | Population-pyramid-style diverging bar chart with a shared zero baseline. |

### Plots

| Component | Import path | Description |
| --- | --- | --- |
| `BarPlot` | `$lib/plots/bar/Plot.svelte` | Vertical bar chart. Supports multiple series and per-series range segments. |
| `HeatmapPlot` | `$lib/plots/heatmap/Plot.svelte` | Grid of colour-coded cells. |
| `LinePlot` | `$lib/plots/line/Plot.svelte` | Line chart. Supports multiple series and per-series range segments with independent stroke styles. |
| `PyramidPlot` | `$lib/plots/pyramid/Plot.svelte` | Diverging horizontal bar chart; each series is mirrored left or right of a shared zero baseline. |

All components accept explicit `width` and `height` in pixels (svelteplot does not auto-size).

---

### Plot props

Plots accept either `series` (pre-built `Series[]`) or the `data` + `x`/`y`/`z` flat-rows path — these are mutually exclusive.

| Prop | Type | Default | BarPlot | HeatmapPlot | LinePlot | PyramidPlot |
| ---- | ---- | ------- | ------- | ----------- | -------- | ----------- |
| `width` | `number` | — | ✅ | ✅ | ✅ | ✅ |
| `height` | `number` | — | ✅ | ✅ | ✅ | ✅ |
| `series` | `Series[]` | — | ✅ | ✅ | ✅ | ✅ |
| `data` | `TData[]` | — | ✅ | ✅ | ✅ | ✅ |
| `x` | `Accessor` | — | ✅ | ✅ | ✅ | ✅ |
| `y` | `Accessor` | — | ✅ | ✅ | ✅ | ✅ |
| `z` | `Accessor` | — | ✅ | ✅ | ✅ | ✅ |
| `segments` | `SegmentsMap<TStyle>` | `{}` / `[]` | ✅ | ✅ | ✅ | ✅ |
| `markers` | `Marker[]` | `[]` | ✅ | ✅ | ✅ | ✅ |
| `scales` | `ScalesConfig` | `{}` | ✅ | ✅ | ✅ | ✅ |
| `margins` | `MarginConfig` | `{}` | ✅ | ✅ | ✅ | ✅ |
| `tooltip` | `TooltipRuntime` | | ✅ | ✅ | ✅ | ✅ |
| `styles` | `PlotStyles` | | ✅ | ✅ | ✅ | ✅ |

#### `PlotStyles` sub-properties (plots)

| Sub-prop | Type | BarPlot default | HeatmapPlot default | LinePlot default | PyramidPlot default |
| -------- | ---- | --------------- | ------------------- | ---------------- | ------------------- |
| `styles.values.show` | `boolean` | `false` | `true` | `false` (last point) | `false` |
| `styles.values.format` | `(v: number, seriesName: string) => string` | `v => \`${v}\`` | `v => \`${v}\`` | `(v, name) => \`${name} - ${v}\`` | `v => \`${v}\`` |
| `styles.values.anchor` | `'outside' \| 'start' \| 'middle' \| 'end'` | `'outside'` | — | `'start'` | `'outside'` |
| `styles.values.dx` | `number` | | | | |
| `styles.values.dy` | `number` | | | | |
| `styles.values.textAnchor` | `'start' \| 'end' \| 'middle'` | | `'middle'` | | |
| `styles.values.lineAnchor` | `'top' \| 'bottom' \| 'middle'` | | `'middle'` | | |
| `styles.values.rotate` | `number` | | | | |
| `styles.values.class` | `string` | | | | |
| `styles.values.textClass` | `string` | | | | |
| `styles.colors.min` | `string` | — | cfg `continuous.min` | — | — |
| `styles.colors.max` | `string` | — | cfg `continuous.max` | — | — |
| `styles.colors.left` | `string` | — | — | — | palette index 0 |
| `styles.colors.right` | `string` | — | — | — | palette index 1 |

---

### Chart props

| Prop | Type | Default | BarChart | HeatmapChart | LineChart | PyramidChart |
| ---- | ---- | ------- | -------- | ------------ | --------- | ------------ |
| `width` | `number` | — | ✅ | ✅ | ✅ | ✅ |
| `height` | `number` | — | ✅ | ✅ | ✅ | ✅ |
| `data` | `TRow[]` | — | ✅ | ✅ | ✅ | ✅ |
| `x` | `Accessor` | — | ✅ | ✅ | ✅ | ✅ |
| `y` | `Accessor` | — | ✅ | ✅ | ✅ | ✅ |
| `z` | `Accessor` | — | ✅ | ✅ | ✅ | ✅ |
| `title` | `string` | | ✅ | ✅ | ✅ | ✅ |
| `subtitle` | `string` | | ✅ | ✅ | ✅ | ✅ |
| `caption` | `string` | | ✅ | ✅ | ✅ | ✅ |
| `legend` | `LegendSection[]` | | ✅ | ✅ | ✅ | ✅ |
| `segments` | `SegmentsMap<TStyle>` | `{}` / `[]` | ✅ | ✅ | ✅ | ✅ |
| `markers` | `Marker[]` | `[]` | ✅ | ✅ | ✅ | ✅ |
| `scales` | `ScalesConfig` | `{}` | ✅ | ✅ | ✅ | ✅ |
| `margins` | `MarginConfig` | `{}` | ✅ | ✅ | ✅ | ✅ |
| `facet` | `FacetConfig` | | ✅ | ✅ | ✅ | ✅ |
| `timeline` | `TimelineConfig` | | ✅ | ✅ | ✅ | ✅ |
| `tooltip` | `TooltipProp` | | ✅ | ✅ | ✅ | ✅ |
| `styles` | `PlotStyles` | | ✅ | ✅ | ✅ | ✅ |

See the [PlotStyles sub-properties table](#plotstyles-sub-properties-plots) above — charts accept the same `styles` shape and pass it through to their underlying plot.  

---

### Segments

The `segments` prop separates data ranges from visual styling. Every plot kind shares the same underlying types; the style shape (`TStyle`) differs per mark.

| Plot | `segments` type |
| ---- | --------------- |
| `LinePlot` / `LineChart` | `SegmentsMap<LineSegmentStyle>` |
| `BarPlot` / `BarChart` | `SegmentsMap<BarSegmentStyle>` |
| `PyramidPlot` / `PyramidChart` | `SegmentsMap<BarSegmentStyle>` |
| `HeatmapPlot` / `HeatmapChart` | `SegmentsMap<CellSegmentStyle>` (array form only) |

#### Core types

```ts
type Range   = { from?: AxisValue; to?: AxisValue };   // half-open on either side
type Area    = { x?: Range; y?: Range };               // 2-D rectangular region
type Segment<TStyle> = { areas?: Area[]; style?: TStyle };
```

A **`Segment`** matches a data point (or heatmap cell) when the point falls inside **any** of its `areas`. Omitting `areas` (or providing an empty array) makes the segment match **all** data — useful as a baseline style. Segments are rendered in order; later ones appear on top.

An **`Area`** restricts by x, y, or both. Both bounds of a `Range` are **inclusive**. Omitting `x` or `y` leaves that axis unrestricted.

#### `SegmentsMap` forms

```ts
// Array form — same segments apply to every series (required for heatmaps)
type SegmentsMap<TStyle> = Segment<TStyle>[];

// Record form — segments keyed by series name (line / bar / pyramid)
type SegmentsMap<TStyle> = SeriesAwareSegmentsMap<TStyle>;
                         = Record<string, Segment<TStyle>[]>;
```

#### Examples

**Line chart — colour a period and leave the rest as the palette default:**

```svelte
<LinePlot
  {width} {height}
  series={[{ name: 'gdp', x: 'year', y: 'value', data: GDP }]}
  segments={{
    gdp: [
      { style: { stroke: { stroke: '#94a3b8', strokeWidth: 1 } } },
      { areas: [{ x: { from: 2008, to: 2010 } }],
        style: { stroke: { stroke: '#ef4444', strokeWidth: 3 } } },
    ],
  }}
/>
```

**Heatmap — highlight specific columns, rows, and individual cells:**

```svelte
<HeatmapChart
  {width} {height} {data} {x} {y} {z}
  segments={[
    { areas: [{ x: { from: 'Q1', to: 'Q1' } }, { x: { from: 'Q3', to: 'Q3' } }],
      style: { stroke: '#f59e0b', strokeWidth: 2 } },
    { areas: [{ x: { from: 'Q2', to: 'Q2' }, y: { from: 1, to: 2 } }],
      style: { fill: '#ef4444', fillOpacity: 0.8 } },
  ]}
/>
```

Omitting `segments` renders every mark in its default palette colour.

---

## Public API

```ts
import {
  ...
} from '@fundar/data-chart-telling';
```
