<script lang="ts">
	import { HeatmapPlot } from '@fundar/data-chart-telling';
	import { SALES } from '../data';
</script>

<HeatmapPlot width={560} height={360} data={SALES} x="quarter" y="product" color="sales" />
