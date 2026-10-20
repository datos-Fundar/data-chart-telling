<script lang="ts">
	import { HeatmapPlot } from '@fundar/data-chart-telling';
	import { HOUSEHOLDS } from './data';
</script>

<!-- One cell per number of rooms and of people, colored by the share of households. -->
<HeatmapPlot width={560} height={360} data={HOUSEHOLDS} x="rooms" y="people" color="share" />
