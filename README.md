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
| `GeoPlot` | `$lib/plots/geo/Plot.svelte` | Geographic map rendered from GeoJSON/TopoJSON with optional choropleth styling and interactive markers. |

All components accept explicit `width` and `height` in pixels (svelteplot does not auto-size).

---

### Plot props (BarPlot, LinePlot, HeatmapPlot, PyramidPlot)

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
| `segments` | `Segments<TStyle>` | `[]` | ✅ | ✅ | ✅ | ✅ |
| `markers` | `Marker[]` | `[]` | ✅ | ✅ | ✅ | ✅ |
| `scales` | `ScalesConfig` | `{}` | ✅ | ✅ | ✅ | ✅ |
| `margins` | `MarginConfig` | `{}` | ✅ | ✅ | ✅ | ✅ |
| `tooltip` | `TooltipRuntime` | | ✅ | ✅ | ✅ | ✅ |
| `styles` | `PlotStyles` | | ✅ | ✅ | ✅ | ✅ |

#### GeoPlot props

Unlike x/y plots, `GeoPlot` uses GeoJSON/TopoJSON as its data source (no x/y/z axes). It accepts either a `FeatureCollection`, a `Feature[]`, or a TopoJSON `Topology` (with the `object` key to specify which named object to extract).

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `width` | `number` | — | Plot width in pixels. |
| `height` | `number` | — | Plot height in pixels. |
| `data` | `FeatureCollection \| Feature[] \| Topology` | — | GeoJSON (FeatureCollection or Feature array) or TopoJSON Topology. |
| `object` | `string` | — | Required when `data` is a TopoJSON Topology — the key under `topology.objects` to extract. |
| `featureId` | `Accessor<GeoFeature, string>` | `feature.id ?? feature.properties?.id ?? feature.properties?.name` | Resolver for each feature's stable id (used for `segments` lookup and hover identification). |
| `value` | `(feature: GeoFeature) => number \| undefined` | — | Optional continuous accessor for choropleth colouring (mirrors heatmap's `z`). |
| `excludeParts` | `(part: GeoGeometry, feature: GeoFeature) => boolean` | — | Excludes matching geometry parts from rendering/hover (e.g. for inset markers). Return `true` to exclude. |
| `segments` | `Segments<GeoSegmentStyle>` | `[]` | Per-feature styling (keyed by `featureId`). |
| `markers` | `GeoMarker[]` | `[]` | Array of markers: `graticule`, `sphere`, `dot`, `vector`, `link`, `contour`, `inset`, or custom `component`. |
| `scales` | `GeoScalesConfig` | `{}` | Projection and colour scale config. |
| `margins` | `MarginConfig` | `{}` | Top/right/bottom/left margin overrides. |
| `tooltip` | `TooltipRuntime<GeoFeature>` | — | Hover/click tooltip configuration. |
| `styles` | `GeoStyles<TProps>` | — | Base map fill, choropleth ramp, tile layer, zoom, and click handlers. |

#### `PlotStyles` sub-properties (BarPlot, LinePlot, HeatmapPlot, PyramidPlot)

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

#### `GeoStyles` sub-properties (GeoPlot)

| Sub-prop | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `styles.fill` | `string` | palette[0] | Base map fill for features not styled by `segments` or choropleth. |
| `styles.fillOpacity` | `number` | `1` | Base map fill opacity. |
| `styles.stroke` | `string` | cfg `axis.color` | Base map feature stroke colour. |
| `styles.strokeWidth` | `number` | `0.5` | Base map feature stroke width. |
| `styles.colors.min` | `string` | cfg `continuous.min` | Choropleth ramp minimum colour (when `value` is provided). |
| `styles.colors.max` | `string` | cfg `continuous.max` | Choropleth ramp maximum colour (when `value` is provided). |
| `styles.tileLayer` | `GeoTileLayerConfig` | — | XYZ raster basemap config (URL, opacity, zoom range). Mercator-family projections only. |
| `styles.zoom` | `boolean \| GeoZoomConfig` | `false` | Enable/configure drag-pan + scroll-zoom (`false` = static map). |
| `styles.onFeatureClick` | `(feature: GeoFeature, event: Event) => void` | — | Click handler for base-map features. |

#### Scales: `ScalesConfig` (x/y plots) vs `GeoScalesConfig` (GeoPlot)

X/Y plots use `ScalesConfig` with `x`, `y`, `z` axis configurations. GeoPlot uses `GeoScalesConfig` with projection and colour settings instead:

| Prop | ScalesConfig (BarPlot, LinePlot, HeatmapPlot, PyramidPlot) | GeoScalesConfig (GeoPlot) |
| ---- | ------- | ------- |
| `x` | ✅ (AxisScale) | ❌ |
| `y` | ✅ (AxisScale) | ❌ |
| `z` | ✅ (AxisScale) | ❌ |
| `projection` | ❌ | ✅ (GeoProjectionConfig) |
| `color` | ❌ | ✅ (`{ domain?: [number, number] }`) |

#### Props distribution across all plot kinds

| Prop | BarPlot | HeatmapPlot | LinePlot | PyramidPlot | GeoPlot | Notes |
| ---- | ------- | ----------- | -------- | ----------- | ------- | ----- |
| `width` | ✅ | ✅ | ✅ | ✅ | ✅ | Common to all plots. |
| `height` | ✅ | ✅ | ✅ | ✅ | ✅ | Common to all plots. |
| `segments` | ✅ | ✅ | ✅ | ✅ | ✅ | Common to all plots; GeoPlot uses `Segments<GeoSegmentStyle>`, others use their own `SegmentStyle` type. |
| `markers` | ✅ | ✅ | ✅ | ✅ | ✅ | Common to all plots; GeoPlot uses `GeoMarker[]`, others use `Marker[]`. |
| `margins` | ✅ | ✅ | ✅ | ✅ | ✅ | Common to all plots. |
| `tooltip` | ✅ | ✅ | ✅ | ✅ | ✅ | Common to all plots; row type varies per plot. |
| `styles` | ✅ | ✅ | ✅ | ✅ | ✅ | Common; type is `PlotStyles` for x/y plots, `GeoStyles<TProps>` for GeoPlot. |
| `scales` | ✅ | ✅ | ✅ | ✅ | ✅ | Common; type is `ScalesConfig<TData>` for x/y plots, `GeoScalesConfig` for GeoPlot. |
| `series` | ✅ | ✅ | ✅ | ✅ | ❌ | X/Y plots only (mutually exclusive with `data`/`x`/`y`/`z`). |
| `data` | ✅ (TData[]) | ✅ (TData[]) | ✅ (TData[]) | ✅ (TData[]) | ✅ (FeatureCollection \| Feature[] \| Topology) | Common; data shape differs — x/y plots use flat rows, GeoPlot uses geo features. |
| `x` | ✅ | ✅ | ✅ | ✅ | ❌ | X/Y plots only. |
| `y` | ✅ | ✅ | ✅ | ✅ | ❌ | X/Y plots only. |
| `z` | ✅ | ✅ | ✅ | ✅ | ❌ | X/Y plots only (used as series selector in bar/line/pyramid, value accessor in heatmap). |
| `object` | ❌ | ❌ | ❌ | ❌ | ✅ (optional) | GeoPlot only; required when `data` is a TopoJSON Topology. |
| `featureId` | ❌ | ❌ | ❌ | ❌ | ✅ (optional) | GeoPlot only; resolves feature identity for `segments` lookup and hover. |
| `value` | ❌ | ❌ | ❌ | ❌ | ✅ (optional) | GeoPlot only; drives choropleth colouring (analogous to heatmap's `z`). |
| `excludeParts` | ❌ | ❌ | ❌ | ❌ | ✅ (optional) | GeoPlot only; filters geometry parts from rendering. |

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
| `header` | `Snippet` | | ✅ | ✅ | ✅ | ✅ |
| `footer` | `Snippet` | | ✅ | ✅ | ✅ | ✅ |
| `legend` | `LegendSection[]` | | ✅ | ✅ | ✅ | ✅ |
| `segments` | `Segments<TStyle>` | `[]` | ✅ | ✅ | ✅ | ✅ |
| `markers` | `Marker[]` | `[]` | ✅ | ✅ | ✅ | ✅ |
| `scales` | `ScalesConfig` | `{}` | ✅ | ✅ | ✅ | ✅ |
| `margins` | `MarginConfig` | `{}` | ✅ | ✅ | ✅ | ✅ |
| `facet` | `FacetConfig` | | ✅ | ✅ | ✅ | ✅ |
| `timeline` | `TimelineConfig` | | ✅ | ✅ | ✅ | ✅ |
| `tooltip` | `TooltipProp` | | ✅ | ✅ | ✅ | ✅ |
| `styles` | `PlotStyles` | | ✅ | ✅ | ✅ | ✅ |

`header` and `footer` are Svelte 5 snippets that replace the string props when richer markup is needed (custom styles, logos, links, etc.). When `header` is provided it takes full precedence over `title`/`subtitle`; when `footer` is provided it takes full precedence over `caption`. Use the natural snippet syntax:

```svelte
<LineChart ...>
  {#snippet header()}
    <div style="display:flex; justify-content:space-between">
      <h3 style="color:#2563eb">My Chart</h3>
      <img src="/logo.svg" alt="Logo" />
    </div>
  {/snippet}

  {#snippet footer()}
    <small>Source: <a href="...">Dataset</a> · Updated Q3 2024</small>
  {/snippet}
</LineChart>
```

See the [PlotStyles sub-properties table](#plotstyles-sub-properties-plots) above — charts accept the same `styles` shape and pass it through to their underlying plot.  

---

### Segments

The `segments` prop separates data ranges from visual styling. Every plot kind shares the same underlying types; the style shape (`TStyle`) differs per mark.

| Plot | `segments` type | Key structure | Lookup |
| ---- | --------------- | ------------- | ------ |
| `LinePlot` / `LineChart` | `Segments<LineSegmentStyle>` | Named keys (series names) or `'default'` | By series name (`z` accessor or series index). |
| `BarPlot` / `BarChart` | `Segments<BarSegmentStyle>` | Named keys (series names) or `'default'` | By series name (`z` accessor or series index). |
| `PyramidPlot` / `PyramidChart` | `Segments<BarSegmentStyle>` | Named keys (series names) or `'default'` | By series name (`z` accessor or series index). |
| `HeatmapPlot` / `HeatmapChart` | `Segments<CellSegmentStyle>` | `'default'` key only | All cells (can be restricted by `areas` coordinates). |
| `GeoPlot` | `Segments<GeoSegmentStyle>` | Named keys (feature ids) or `'default'` | By feature id (`featureId` accessor or derived from properties). |

**Segment styles by plot:**

| SegmentStyle type | Supports | Plot(s) |
| --- | --- | --- |
| `LineSegmentStyle` | `stroke` (line), `dots` (endpoint markers) | `LinePlot` / `LineChart` |
| `BarSegmentStyle` | `fill`, `fillOpacity` | `BarPlot` / `BarChart`, `PyramidPlot` / `PyramidChart` |
| `CellSegmentStyle` | `fill`, `fillOpacity`, `stroke`, `strokeWidth` | `HeatmapPlot` / `HeatmapChart` |
| `GeoSegmentStyle` | `fill`, `fillOpacity`, `stroke`, `strokeWidth` | `GeoPlot` |

#### Core types

```ts
type Range           = { from?: AxisValue; to?: AxisValue };  // inclusive on both sides
type Area            = { x?: Range; y?: Range };              // 2-D rectangular region
type Segment<TStyle> = { areas?: Area[]; style?: TStyle };
```

A **`Segment`** matches a data point (or heatmap cell) when the point falls inside **any** of its `areas`. Omitting `areas` creates a **catch-all** that matches every data point — but catch-alls are always evaluated **last**, regardless of their position in the list, so area-specific segments always win. This lets a catch-all placed first act as a fallback baseline that highlighted ranges override.

An **`Area`** restricts by x, y, or both. Both bounds of a `Range` are **inclusive**. Omitting `x` or `y` leaves that axis unrestricted.

#### `Segments` structure

`segments` is always an **array of groups**. Each group is a plain object whose keys map to `Segment[]` lists:

```ts
// 'default' key — applies its segments to every series
type DefaultSegmentsMap<TStyle>     = { default: Segment<TStyle>[] };

// named keys — applies segments only to the named series
type SeriesAwareSegmentsMap<TStyle> = Record<string, Segment<TStyle>[]>;

// one element of the array — either form, or a mix of both key types
type SegmentsStyle<TStyle> = DefaultSegmentsMap<TStyle> | SeriesAwareSegmentsMap<TStyle>;

// the prop type: an ordered list of groups
type Segments<TStyle> = SegmentsStyle<TStyle>[];
```

Having multiple groups lets you organise segments by concern — for example one group for per-series stroke colours and a second for shared dot markers applied via `'default'`. Groups are processed in order and their resolved segments are concatenated per series before evaluation.

#### Examples

**Line chart — baseline colour with a highlighted range (catch-all as fallback):**

```svelte
<LinePlot
  {width} {height}
  series={[{ name: 'gdp', x: 'year', y: 'value', data: GDP }]}
  segments={[
    {
      gdp: [
        { style: { stroke: { stroke: '#94a3b8', strokeWidth: 1 } } },
        { areas: [{ x: { from: 2008, to: 2010 } }],
          style: { stroke: { stroke: '#ef4444', strokeWidth: 3 } } },
      ],
    },
  ]}
/>
```

**Line chart — per-series baseline colours + shared dot markers (two-group approach):**

```svelte
<LinePlot
  {width} {height}
  data={LIFE_EXPECTANCY} x="year" y="value" z="sex"
  segments={[
    // Group 1: per-series catch-all stroke colours
    { female: [{ style: { stroke: { stroke: 'steelblue' } } }],
      male:   [{ style: { stroke: { stroke: 'tomato'    } } }] },
    // Group 2: dots for all series in a specific range
    { default: [
        { areas: [{ x: { from: 2010, to: 2012 } }],
          style: { dots: { dotRadius: 5, dotSymbol: 'circle' } } },
      ],
    },
  ]}
/>
```

**Heatmap — highlight specific columns, rows, and individual cells:**

```svelte
<HeatmapChart
  {width} {height} {data} {x} {y} {z}
  segments={[
    {
      default: [
        { areas: [{ x: { from: 'Q1', to: 'Q1' } }, { x: { from: 'Q3', to: 'Q3' } }],
          style: { stroke: '#f59e0b', strokeWidth: 2 } },
        { areas: [{ x: { from: 'Q2', to: 'Q2' }, y: { from: 1, to: 2 } }],
          style: { fill: '#ef4444', fillOpacity: 0.8 } },
      ],
    },
  ]}
/>
```

**GeoPlot — per-feature styling and catch-all fallback (note: GeoPlot keys are feature ids, not series names):**

```svelte
<GeoPlot
  {width} {height}
  data={COUNTRIES_GEOJSON}
  value={(f) => f.properties?.population}
  segments={[
    {
      // Catch-all baseline (always evaluated last)
      default: [
        { style: { fillOpacity: 0.7, stroke: '#94a3b8' } },
      ],
      // Per-feature overrides (matched by feature id)
      argentina: [
        { style: { fill: '#3b82f6', fillOpacity: 0.9 } },
      ],
      brazil: [
        { style: { fill: '#ef4444', fillOpacity: 0.9 } },
      ],
    },
  ]}
/>
```

Omitting `segments` (or passing `[]`) renders every mark in its default palette colour.

---

## Public API

```ts
import {
  ...
} from '@fundar/data-chart-telling';
```
