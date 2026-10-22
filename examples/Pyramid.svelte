<script lang="ts">
	import { PyramidPlot } from '@fundar/data-chart-telling';
	import { POPULATION_BY_AGE_AT_2022 } from './datasets';
</script>

<!-- A population pyramid: one side per `color` value. -->
<PyramidPlot
	width={720}
	height={400}
	data={POPULATION_BY_AGE_AT_2022}
	x="share"
	y="ageGroup"
	color="sex"
/>
