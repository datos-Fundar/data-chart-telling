<script lang="ts">
	import { ClevelandPlot } from '@fundar/data-chart-telling';
	import { AGE_SHARES } from './data';
</script>

<!-- One dot per census year in each age group, joined from the lowest share to the highest. The years follow one another, so they take a sequential blues ramp. -->
<ClevelandPlot
	width={720}
	height={400}
	data={AGE_SHARES}
	x="share"
	y="ageGroup"
	grouping="year"
	scales={{ color: { scheme: 'blues', schemeRange: [0.3, 1] } }}
/>
