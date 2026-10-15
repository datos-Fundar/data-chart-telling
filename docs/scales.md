# Scales

`scales` configures how data values become positions and visual properties. It has one entry per channel.

```svelte
<LinePlot
	{width}
	{height}
	data={rows}
	x="date"
	y="index"
	color="division"
	scales={{
		x: { label: 'Month' },
		y: { label: 'Index (Jan 2021 = 100)', domain: [90, 280], grid: true },
		color: {
			scheme: { Food: '#1b9e77', Transport: '#d95f02', Housing: '#7570b3', Health: '#e7298a' }
		}
	}}
/>
```

![A line plot with a labelled axis, gridlines and custom colors](images/scales.png)

## Axes: `x` and `y`

Each axis takes an `AxisScale`.

| Field | Meaning |
| --- | --- |
| `type` | `'auto'` (default), `'linear'`, `'pow'`, `'sqrt'`, `'log'`, `'symlog'`, `'time'`, `'utc'`, `'band'`, `'point'`, `'ordinal'`, `'categorical'` and the color-oriented types (`'sequential'`, `'diverging'`, `'threshold'`, ...) |
| `domain`, `range` | Explicit input and output extent |
| `reverse`, `nice`, `zero`, `clamp`, `round`, `percent` | Direction, rounding and baseline behaviour |
| `label`, `labelAnchor`, `labelOrientation`, `labelPosition`, `titleFontSize` | The axis title (`label: false` hides it) |
| `ticks`, `tickSpacing`, `tickSize`, `tickPadding`, `tickRotate` | Tick placement and size |
| `tickFormat` | `false`, an `Intl.NumberFormatOptions` / `Intl.DateTimeFormatOptions` object, or `(d, index, ticks) => string` |
| `grid` | `true` or a stroke style for gridlines |
| `axisDisplay` | `'visible'` (default), `'hidden'` (keeps the space, so aligned panels stay aligned) or `'none'` |
| `padding`, `paddingInner`, `paddingOuter`, `align` | Band and point spacing |
| `insetLeft`, `insetRight`, `insetTop`, `insetBottom` | Pixels kept free at each end |
| `interval`, `base`, `constant`, `sort` | Time/discrete intervals, log base, symlog constant, category order |

Number and date text defaults follow `axis.locale` and `axis.compactDisplay` in the [configuration](theming.md#locale).

## Color

`scales.color` configures the `color` channel (and a choropleth on a map).

| Field | Meaning |
| --- | --- |
| `domain` | `[min, max]` for a continuous value, or the list of categories |
| `scheme` | A named [d3-scale-chromatic](https://d3js.org/d3-scale-chromatic) ramp (`'turbo'`, `'blues'`, `'rdylbu'`, case-insensitive), two or more colors to interpolate, or a `Record<category, color>` |
| `pivot` | Splits an array `scheme` into two halves meeting at this value (a diverging ramp) |
| `unknown` | Color of a value outside the mapping (default `#ccc`) |

A continuous ramp is set with `scheme: [colorA, colorB]`. Categorical colors come from the configuration's `palette` unless `scheme` is a category-to-color record.

A marker can carry its own `scales.color`, independent of the plot's, so two ramps can coexist in one plot.

## Grouping

`scales.grouping.reverse` flips which group sorts first, such as which side of a [pyramid](plots.md#pyramidplot) a series sits on.

## Opacity

`scales.opacity` maps a value to an opacity: `domain` (`[min, max]` or categories), `range` (`[minOpacity, maxOpacity]` or a category-to-opacity record), `unknown`.

## Symbol

`scales.symbol` maps categories to shapes: `domain`, `range` (a list of `SymbolType` cycled in order, or a record), `unknown`. The default shape cycle is `symbols` in the configuration.

## Radius and length

`scales.r` (dot radius) and `scales.length` (vector length) take `domain: [min, max]` and `range: [minPx, maxPx]`. The radius scale is a square-root scale, so a dot's area follows its value; hand it raw values, not pre-scaled radii.

## Shared and free scales

[Facets](facets.md) and [timelines](timeline.md) share scales across panels or steps by default so panels stay comparable; each has an option to refit per panel or step.
