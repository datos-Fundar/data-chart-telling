<script lang="ts">
	import { PyramidPlot } from '@fundar/data-chart-telling';
	import { AGES } from './datasets';
</script>

<!-- A population pyramid: one side per `color` value. -->
<PyramidPlot width={720} height={400} data={AGES} x="share" y="ageGroup" color="sex" />
