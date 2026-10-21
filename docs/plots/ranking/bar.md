# BarPlot

Part of [Plots](../../plots.md).

Bars where one axis holds the categories and the other the values. Categories on `x` give vertical bars; categories on `y` give horizontal bars.

<!-- example: examples/GroupedBars.svelte -->

```svelte
<script lang="ts">
	import { BarPlot } from '@fundar/data-chart-telling';
	import { PROVINCE_VALUES } from './data';
</script>

<!-- Vertical bars, grouped by `color`. -->
<BarPlot
	width={720}
	height={400}
	data={PROVINCE_VALUES}
	x="province"
	y="value"
	color="sex"
	scales={{ y: { domain: [70, 85] } }}
/>
```

<!-- /example -->

![Vertical grouped bars](../../images/grouped-bars.png)

<!-- example: examples/HorizontalBars.svelte -->

```svelte
<script lang="ts">
	import { BarPlot } from '@fundar/data-chart-telling';
	import { PROVINCE_VALUES } from './data';
</script>

<!-- Horizontal bars: the categories go on `y`, the values on `x`. -->
<BarPlot
	width={720}
	height={400}
	data={PROVINCE_VALUES}
	x="value"
	y="province"
	color="sex"
	scales={{ x: { domain: [70, 85] } }}
/>
```

<!-- /example -->

![Horizontal grouped bars](../../images/horizontal-bars.png)

- Several series sharing a category sit side by side, each in its slice of the category band. The gap between them is `bar.seriesPadding` in the configuration.
- `transforms={[{ type: 'stackY' }]}` stacks the series instead. Stacking is always `stackY`, also for horizontal bars, because the value channel is the one stacked.
- `scales.x.paddingInner` / `paddingOuter` set the spacing between category bands.
- `styles.values.show` labels each bar; `styles.values.anchor` places the label (`'outside'`, `'start'`, `'middle'`, `'end'`).
- The tooltip triggers anywhere over a bar's whole band, not just over the visible bar.
