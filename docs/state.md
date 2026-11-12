# Reading plot state

A plot's state - its hover, legend, timeline, margins, scales, rows and size - can be read from anything drawn with it, to build custom UI. Both hooks are read-only, except for the legend (series can be turned on and off) and the timeline (it can be played and moved). Call them while a component initializes; outside a plot or a figure they throw.

## `useFigure()`

Works anywhere inside a figure, including the `header`, `footer` and `content` snippets of a plot or composer. It returns:

- `hover` - `activeX`, `activeY`, `activeSeries`, `strategy`, `sync`, `source` (the id of the plot owning the hover).
- `legend` (or `null`) - `entries`, `range`, `setRange([min, max] | null, mode?)` (narrows the continuous section as dragging it would, or resets it), `off` (names of hidden series), `isOff(name)`, `turnOff(name, action)`, `turnOn(name)`, `toggle(name, action)`. `action` is `{ mode: 'dim' | 'hide' | 'omit' | 'rescale' }`; `'omit'` removes the series and refits the axes, and `'rescale'` also makes the parts left of a whole (a stack, a treemap) the new 100%.
- `timeline` (or `null`) - `enabled`, `steps`, `value`, `index`, `progress`, `playing`, `loop`, `speed`, `speeds`, `controls`, and `seek`, `seekIndex`, `seekValue`, `next`, `previous`, `play`, `pause`, `toggle`, `setLoop`, `setSpeed`, `cycleSpeed`. On a timeline of dates, `steps` and `value` are `Date`s and `seekValue` takes a `Date` or a date string.

A footer that toggles series through the legend:

```svelte
<!-- FigureReadout.svelte -->
<script lang="ts">
	import { useFigure } from '@fundar/data-chart-telling';

	const figure = useFigure();
	const series = $derived(
		(figure.legend?.entries ?? []).flatMap((e) => (e.type === 'series' ? [e] : []))
	);
</script>

{#each series as entry (entry.name)}
	<button onclick={() => figure.legend?.toggle(entry.name, { mode: 'omit' })}>
		{figure.legend?.isOff(entry.name) ? 'Show' : 'Hide'}
		{entry.name}
	</button>
{/each}
```

```svelte
{#snippet footer()}<FigureReadout />{/snippet}
<LinePlot data={rows} x="year" y="value" color="sex" tooltip {footer} />
```

## `usePlot()`

Works inside a plot - in a [`component` marker](markers.md#custom-components), which is mounted in the plot's SVG. It returns everything `useFigure()` does, plus:

- `hover.points`, `hover.activePoint`, `hover.tooltip` (`visible`, `position`, `rows`) for this plot;
- `margins`, `scales`, `axes`, `data`, `width`, `height`;
- `contextOf(row)` - what the plot knows of one of its rows (see [Row context](#row-context));
- `svelteplot` - svelteplot's own `usePlot()` state for this plot.

```svelte
<!-- HoverReadout.svelte -->
<script lang="ts">
	import { usePlot } from '@fundar/data-chart-telling';

	const plot = usePlot();
	const point = $derived(plot.hover.activePoint);
</script>

<text x={plot.margins.left + 8} y={plot.margins.top + 16}>
	{point ? `${point.series} at ${point.x}: ${point.label}` : 'Hover the plot'}
</text>
```

```svelte
<LinePlot
	...
	tooltip
	markers={[{ type: 'hover' }, { type: 'component', component: HoverReadout }]}
/>
```

## Row context

A plot works out a context for every row it draws, once, as it reads its data: the `series` the row is drawn in, its `x` and `y` (its own values, not a stack's running total, or where the plot's transforms put it), the `value` it shows on the value axis, the `row` itself, and whatever the plot kind works out for it. Everything that writes about a row reads the same context, so a value the plot computes - a tile's share, a density's estimate, a bin's count - is there to read without working it out again:

- `tooltip.format(row, number, context)`;
- `styles.values.format(value, number, context)`;
- the `hover` marker's points (`point.context`), in its `format` and in its `back` and `front` markers;
- `usePlot().contextOf(row)` in a `component` marker, and `RowContext.of(row)` anywhere, from a row the plot drew or a copy of it (the one a mark's accessor gets).

What each plot kind adds:

| Plot                    | `value`                               | Also                                                                            |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| Most plots              | the row's own value                   | -                                                                               |
| `DensityPlot`           | the estimated density                 | `x` (or `y` when horizontal) is the point it is estimated at                    |
| `HistogramPlot`         | the bin's count                       | `count`, `from`, `to` (the bin's edges)                                         |
| `BoxPlot`, `ViolinPlot` | the value (a hovered box: its median) | the box's `category`, `min`, `p25`, `median`, `p75`, `max`, `count`, `outliers` |
| `TreemapPlot`           | the tile's summed value               | `name`, `path`, `share` (0 to 100); no `x` or `y`                               |
| `HeatmapPlot`           | the cell's color value                | -                                                                               |

```svelte
<HistogramPlot
	data={ages}
	x="age"
	tooltip={{
		format: (_row, number, context) => `${context.from}-${context.to}: ${number(context.count)}`
	}}
/>
```

The types are `PlotRowContext`, and per kind `TreemapRowContext`, `HistogramRowContext` and `BoxRowContext`.

## When to use them

Reach for these instead of re-implementing a legend, a timeline control or a hover readout beside the plot: the figure already holds that state, and a widget reading it stays in step with the plot. [examples/LegendReader.svelte](../examples/LegendReader.svelte) is a runnable reader, and the Storybook group _Configuration / State_ has both patterns.
