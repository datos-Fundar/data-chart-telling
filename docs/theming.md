# Theming

The whole package reads its styling - fonts, colors, spacing, the legend, tooltip, axes, plot geometry - from one global, reactive configuration. Changing it re-themes every plot on screen; nothing is passed prop by prop.

```ts
import {
	setConfiguration,
	getConfiguration,
	resetConfiguration,
	THEMES
} from '@fundar/data-chart-telling';

setConfiguration(THEMES.Editorial); // a ready-made theme

setConfiguration({
	font: '"Inter", sans-serif',
	palette: ['#4f46e5', '#e6580d', '#16a34a'],
	legend: { continuous: { label: { size: '0.8125rem', weight: 400 } } }
});

getConfiguration(); // the live, merged configuration
resetConfiguration(); // back to the shipped defaults
```

- `setConfiguration` takes a deep-partial patch and deep-merges it into the current configuration: name only the leaves to change. It is reactive, so mounted plots update.
- Call it once at startup, or when the theme switches. It is global, not per plot; a plot's own props (`styles`, `scales`, a legend section's `format`, ...) always win over it.
- The configuration is cloned when stored, so it holds data only: numbers, strings, arrays, objects. Functions belong in plot props such as `format` and `tickFormat`.
- When `setConfiguration` runs inside an `$effect`, wrap the call in `untrack` so the effect does not re-trigger itself.
- `THEMES` holds `Default`, `Editorial`, `Dark` and `Compact`; each is a patch for `setConfiguration`.
- The complete shape is the type `PlotStylesConfig` (patches: `PlotStylesConfigInput`); the shipped values are `DEFAULT_CONFIG`.

## Sections

| Key                                                                         | Controls                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `font`, `color`, `background`                                               | Base text of every figure                                                                                                                                                                                                                                                                 |
| `palette`                                                                   | Categorical series colors, in order                                                                                                                                                                                                                                                       |
| `symbols`                                                                   | Shape cycle for the `symbol` channel                                                                                                                                                                                                                                                      |
| `continuous`                                                                | Default ramp endpoints, label color and opacity range for continuous color and opacity                                                                                                                                                                                                    |
| `spacing`, `chrome`                                                         | Padding around header, legend and caption; the chrome `order` and `rowGap`                                                                                                                                                                                                                |
| `title`, `subtitle`, `caption`                                              | Text blocks: `font`, `size`, `weight`, `color`, `leading`, `spacing`                                                                                                                                                                                                                      |
| `divider`                                                                   | The line a `'divider'` in the chrome `order` draws                                                                                                                                                                                                                                        |
| `legend`                                                                    | Text, gaps, swatches, `disabledOpacity`, paginated nav buttons, the continuous bar, its handles, ticks and labels, and the `seriesTitle` and `sizeScale` options                                                                                                                          |
| `axis`                                                                      | Axis color, font and tick sizes, `grid`, and the number locale (below)                                                                                                                                                                                                                    |
| `tooltip`                                                                   | Tooltip background, color, font size, padding, radius, border                                                                                                                                                                                                                             |
| `margins`                                                                   | Default margin per side (`'auto'` or a number)                                                                                                                                                                                                                                            |
| `line`, `area`, `bar`, `pyramid`, `histogram`, `box`, `lollipop`, `scatter` | Per-kind defaults: stroke width, dot radius, series padding, gap fills, fill opacity, inset, box and lollipop padding, stem width                                                                                                                                                         |
| `text`                                                                      | `declutter` geometry of value labels and connectors                                                                                                                                                                                                                                       |
| `hover`                                                                     | Look of the hover marker: `rule`, `dot`, `font`, `area`                                                                                                                                                                                                                                   |
| `delta`                                                                     | The `delta` marker's label, per axis the delta is taken on: `text.x` (beside a vertical delta: `dx: 12`, `textAnchor: 'start'`) and `text.y` (above a horizontal one: `dy: -10`, `textAnchor: 'middle'`). `lineAnchor` picks where along the delta the label sits and how it aligns there |
| `timeline`                                                                  | The rule (`rule`) and the player bar (`player`: controls, speeds, `stepDuration`, button, track, thumb, toggle)                                                                                                                                                                           |
| `facet`                                                                     | The position badge and prev/next buttons                                                                                                                                                                                                                                                  |
| `frameClip`                                                                 | Tolerance for clipping marks to the plot frame                                                                                                                                                                                                                                            |

## Locale

`axis.locale` (default `'es-AR'`) and `axis.compactDisplay` (`'short'` or `'long'`, default `'short'`) set how the automatic tick formatter writes numbers - the one used by any axis without its own `scales.x`/`scales.y.tickFormat`. A legend's size section writes its values the same way. Whether an axis abbreviates at all stays svelteplot's call, based on its value range; these two choose the wording once it does.

```ts
setConfiguration({ axis: { locale: 'en-US', compactDisplay: 'long' } });
```

`axis.locale` updates plots already on screen. `axis.compactDisplay` is read when a plot mounts, so a later change shows on the next mount.

## Edge ticks

`axis.edgeTicks.x` and `axis.edgeTicks.y` (`{ enabled, collision }`, on for x and off for y, both `'drop-nice'`) add a tick at the data's first and last values beside the nice ones, on a continuous axis whose other axis is continuous too, so a reader sees where the data starts and ends. When one lands too close to a nice tick for both labels, `collision` picks what gives way: `'drop-nice'` keeps the data's tick, `'drop-edge'` keeps the nice one, `'extend'` widens the axis to the next nice tick past the data.

```ts
setConfiguration({ axis: { edgeTicks: { x: { enabled: true, collision: 'extend' } } } });
```

A plot overrides it with `scales.x.edgeTicks` or `scales.y.edgeTicks` (see [Scales](scales.md)).

## CSS variables

Some fields reach the DOM as CSS custom properties, which every figure sets on its root element and the components read with a fallback. Those can also be overridden with plain CSS on a wrapping element for a one-off, non-reactive tweak:

```css
.my-dashboard {
	--dct-tooltip-bg: #0b3d2e;
	--dct-title-size: 2rem;
}
```

The remaining fields are plain values read by plot code (palette, tick sizes, margins, per-kind geometry, hover look); `setConfiguration` is the way to change those.

The text blocks map `title`, `subtitle` and `caption` to `--dct-{block}-{font|size|weight|color|leading|spacing}`. Every other variable and the configuration path it comes from:

### base

| CSS variable | Config path  |
| ------------ | ------------ |
| `--dct-font` | `font`       |
| `--dct-fg`   | `color`      |
| `--dct-bg`   | `background` |

### spacing

| CSS variable        | Config path              |
| ------------------- | ------------------------ |
| `--dct-header-pad`  | `spacing.headerPadding`  |
| `--dct-legend-pad`  | `spacing.legendPadding`  |
| `--dct-caption-pad` | `spacing.captionPadding` |
| `--dct-bleed`       | `spacing.bleed`          |

### divider

| CSS variable           | Config path      |
| ---------------------- | ---------------- |
| `--dct-divider-color`  | `divider.color`  |
| `--dct-divider-width`  | `divider.width`  |
| `--dct-divider-style`  | `divider.style`  |
| `--dct-divider-margin` | `divider.margin` |

### chrome

| CSS variable    | Config path     |
| --------------- | --------------- |
| `--dct-row-gap` | `chrome.rowGap` |

### legend

| CSS variable                            | Config path                              |
| --------------------------------------- | ---------------------------------------- |
| `--dct-legend-font`                     | `legend.font`                            |
| `--dct-legend-size`                     | `legend.size`                            |
| `--dct-legend-weight`                   | `legend.weight`                          |
| `--dct-legend-color`                    | `legend.color`                           |
| `--dct-legend-title-size`               | `legend.titleSize`                       |
| `--dct-legend-title-weight`             | `legend.titleWeight`                     |
| `--dct-legend-gap`                      | `legend.gap`                             |
| `--dct-legend-swatch`                   | `legend.swatchSize`                      |
| `--dct-legend-size-gap`                 | `legend.sizeScale.gap`                   |
| `--dct-legend-nav-bg`                   | `legend.navButton.background`            |
| `--dct-legend-nav-color`                | `legend.navButton.color`                 |
| `--dct-legend-nav-size`                 | `legend.navButton.size`                  |
| `--dct-legend-nav-font-size`            | `legend.navButton.fontSize`              |
| `--dct-legend-nav-disabled-opacity`     | `legend.navButton.disabledOpacity`       |
| `--dct-continuous-handle-width`         | `legend.continuous.handle.width`         |
| `--dct-continuous-handle-height`        | `legend.continuous.handle.height`        |
| `--dct-continuous-handle-radius`        | `legend.continuous.handle.radius`        |
| `--dct-continuous-handle-fill`          | `legend.continuous.handle.fill`          |
| `--dct-continuous-handle-stroke`        | `legend.continuous.handle.stroke`        |
| `--dct-continuous-handle-stroke-width`  | `legend.continuous.handle.strokeWidth`   |
| `--dct-continuous-tick-color`           | `legend.continuous.tick.color`           |
| `--dct-continuous-tick-width`           | `legend.continuous.tick.width`           |
| `--dct-continuous-tick-length`          | `legend.continuous.tick.length`          |
| `--dct-continuous-label-rotate`         | `legend.continuous.label.rotate`         |
| `--dct-continuous-label-size`           | `legend.continuous.label.size`           |
| `--dct-continuous-label-weight`         | `legend.continuous.label.weight`         |
| `--dct-continuous-label-overlap-rotate` | `legend.continuous.label.overlap.rotate` |

### axis

| CSS variable       | Config path  |
| ------------------ | ------------ |
| `--dct-axis-color` | `axis.color` |

### tooltip

| CSS variable           | Config path          |
| ---------------------- | -------------------- |
| `--dct-tooltip-bg`     | `tooltip.background` |
| `--dct-tooltip-color`  | `tooltip.color`      |
| `--dct-tooltip-size`   | `tooltip.fontSize`   |
| `--dct-tooltip-pad`    | `tooltip.padding`    |
| `--dct-tooltip-radius` | `tooltip.radius`     |
| `--dct-tooltip-border` | `tooltip.border`     |

### timeline

| CSS variable                       | Config path                               |
| ---------------------------------- | ----------------------------------------- |
| `--dct-timeline-axis`              | `timeline.axisColor`                      |
| `--dct-timeline-active`            | `timeline.activeColor`                    |
| `--dct-timeline-gap`               | `timeline.gap`                            |
| `--dct-player-bg`                  | `timeline.player.background`              |
| `--dct-player-color`               | `timeline.player.color`                   |
| `--dct-player-radius`              | `timeline.player.radius`                  |
| `--dct-player-pad`                 | `timeline.player.padding`                 |
| `--dct-player-gap`                 | `timeline.player.gap`                     |
| `--dct-player-size`                | `timeline.player.fontSize`                |
| `--dct-player-weight`              | `timeline.player.fontWeight`              |
| `--dct-player-value-width`         | `timeline.player.valueWidth`              |
| `--dct-player-button-size`         | `timeline.player.button.size`             |
| `--dct-player-button-bg`           | `timeline.player.button.background`       |
| `--dct-player-button-color`        | `timeline.player.button.color`            |
| `--dct-player-button-hover-bg`     | `timeline.player.button.hoverBackground`  |
| `--dct-player-button-radius`       | `timeline.player.button.radius`           |
| `--dct-player-track-height`        | `timeline.player.track.height`            |
| `--dct-player-track-color`         | `timeline.player.track.color`             |
| `--dct-player-track-fill`          | `timeline.player.track.fillColor`         |
| `--dct-player-track-radius`        | `timeline.player.track.radius`            |
| `--dct-player-thumb-size`          | `timeline.player.thumb.size`              |
| `--dct-player-thumb-color`         | `timeline.player.thumb.color`             |
| `--dct-player-toggle-bg`           | `timeline.player.toggle.background`       |
| `--dct-player-toggle-color`        | `timeline.player.toggle.color`            |
| `--dct-player-toggle-active-bg`    | `timeline.player.toggle.activeBackground` |
| `--dct-player-toggle-active-color` | `timeline.player.toggle.activeColor`      |
| `--dct-player-toggle-radius`       | `timeline.player.toggle.radius`           |
| `--dct-player-toggle-size`         | `timeline.player.toggle.fontSize`         |
| `--dct-player-toggle-pad`          | `timeline.player.toggle.padding`          |

### heatmap ramp

| CSS variable      | Config path             |
| ----------------- | ----------------------- |
| `--dct-heat-min`  | `continuous.min`        |
| `--dct-heat-max`  | `continuous.max`        |
| `--dct-heat-text` | `continuous.labelColor` |

### facet

| CSS variable                       | Config path                       |
| ---------------------------------- | --------------------------------- |
| `--dct-facet-indicator-bg`         | `facet.indicator.background`      |
| `--dct-facet-indicator-color`      | `facet.indicator.color`           |
| `--dct-facet-indicator-size`       | `facet.indicator.fontSize`        |
| `--dct-facet-indicator-pad`        | `facet.indicator.padding`         |
| `--dct-facet-indicator-radius`     | `facet.indicator.radius`          |
| `--dct-facet-nav-bg`               | `facet.navButton.background`      |
| `--dct-facet-nav-color`            | `facet.navButton.color`           |
| `--dct-facet-nav-btn-size`         | `facet.navButton.size`            |
| `--dct-facet-nav-font-size`        | `facet.navButton.fontSize`        |
| `--dct-facet-nav-disabled-opacity` | `facet.navButton.disabledOpacity` |
