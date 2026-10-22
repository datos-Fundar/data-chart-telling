# ScatterPlot

Part of [Plots](../../plots.md).

A dot per row.

<!-- example: examples/Scatter.svelte -->

```svelte
<script lang="ts">
	import { ScatterPlot } from '@fundar/data-chart-telling';
	import { COUNTRIES_AT_2007 } from './datasets';
</script>

<!-- Points sized by `r`, colored by `color` and shaped by `symbol`. -->
<ScatterPlot
	width={720}
	height={420}
	data={COUNTRIES_AT_2007}
	x="gdp"
	y="life"
	r="population"
	color="continent"
	symbol="income"
/>
```

<!-- /example -->

![A scatter plot sized, colored and shaped by channels](../../images/scatter.png)

- `r` sizes the dots (area follows the value; configure with `scales.r`). The legend gets a size section.
- `symbol` varies the dot shape by category (`scales.symbol`), `opacity` varies transparency, `color` colors by category or by a continuous ramp.
- A literal number for `r` is a fixed radius in pixels.
- `dotRadius` defaults come from `scatter.dotRadius` in the configuration.
