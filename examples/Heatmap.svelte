<script lang="ts">
	import { HeatmapPlot } from '@fundar/data-chart-telling';
	import { PENGUIN_COUNTS } from './datasets';
</script>

<!-- One cell per island and species, colored by the number of penguins. -->
<HeatmapPlot width={560} height={360} data={PENGUIN_COUNTS} x="island" y="species" color="count" />
