<script lang="ts">
	import { DensityPlot } from '@fundar/data-chart-telling';
	import { HEIGHTS } from './datasets';
</script>

<!-- A smoothed distribution per `grouping` value, the continuous pair of a histogram. -->
<DensityPlot width={720} height={400} data={HEIGHTS} x="height" grouping="group" />
