<script lang="ts">
	import { HistogramPlot } from '@fundar/data-chart-telling';
	import { HEIGHTS } from './datasets';
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
