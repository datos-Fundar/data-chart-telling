<script lang="ts">
	import { BarPlot } from '@fundar/data-chart-telling';
	import { SEX_SHARES } from './data';
</script>

<!-- Each sex's share of the population per census, stacked with `stackY` so a bar adds up to 100%. -->
<BarPlot
	width={720}
	height={400}
	data={SEX_SHARES}
	x="year"
	y="share"
	color="sex"
	transforms={[{ type: 'stackY' }]}
/>
