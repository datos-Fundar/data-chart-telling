# Reading plot state

A plot's state - its hover, legend, timeline, margins, scales, rows and size - can be read from anything drawn with it, to build custom UI. Both hooks are read-only, except for the legend (series can be turned on and off) and the timeline (it can be played and moved). Call them while a component initializes; outside a plot or a figure they throw.

## `useFigure()`

Works anywhere inside a figure, including the `header`, `footer` and `content` snippets of a plot or composer. It returns:

- `hover` - `activeX`, `activeY`, `activeSeries`, `strategy`, `sync`, `source` (the id of the plot owning the hover).
- `legend` (or `null`) - `entries`, `range`, `off` (names of hidden series), `isOff(name)`, `turnOff(name, action)`, `turnOn(name)`, `toggle(name, action)`. `action` is `{ mode: 'dim' | 'hide' | 'omit' }`; `'omit'` removes the series and refits the axes.
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

## When to use them

Reach for these instead of re-implementing a legend, a timeline control or a hover readout beside the plot: the figure already holds that state, and a widget reading it stays in step with the plot. [examples/LegendReader.svelte](../examples/LegendReader.svelte) is a runnable reader, and the Storybook group _Configuration / State_ has both patterns.
