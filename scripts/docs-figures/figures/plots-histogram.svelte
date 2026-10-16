<script lang="ts">
	import { HistogramPlot } from '@fundar/data-chart-telling';
	import { WEIGHTS } from '../data';
</script>

<HistogramPlot
	width={720}
	height={400}
	data={WEIGHTS}
	x="weight"
	grouping="group"
	segments={{ default: [{ styles: { fillOpacity: 0.7 } }] }}
/>
