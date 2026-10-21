# HistogramPlot

Part of [Plots](../plots.md).

Bins the rows of each series along one axis and draws the count per bin. Give `x` alone for vertical bars or `y` alone for horizontal bars.

<!-- example: examples/Histogram.svelte -->

```svelte
<script lang="ts">
	import { HistogramPlot } from '@fundar/data-chart-telling';
	import { HEIGHTS } from './data';
</script>

<!-- Two overlapping distributions, one per `grouping` value. -->
<HistogramPlot
	width={720}
	height={400}
	data={HEIGHTS}
	x="height"
	grouping="group"
	segments={{ default: [{ styles: { fillOpacity: 0.7 } }] }}
/>
```

<!-- /example -->

![Two overlapping histograms](../images/histogram.png)

- `grouping` (or `color`) draws one histogram per group.
- Override the default binning with a `binX` (or `binY`) transform: `transforms={[{ type: 'binX', thresholds: 20 }]}`. A transform given here is merged over the default one.
- `transforms={[{ type: 'stackY' }]}` stacks groups in each bin.
- `segments={{ default: [{ styles: { fillOpacity: 0.7 } }] }}` makes overlapping groups translucent.
