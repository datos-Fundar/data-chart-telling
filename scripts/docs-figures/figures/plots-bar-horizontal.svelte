<script lang="ts">
	import { BarPlot } from '@fundar/data-chart-telling';
	import { PROVINCE_VALUES } from '../data';
</script>

<BarPlot
	width={720}
	height={400}
	data={PROVINCE_VALUES}
	x="value"
	y="province"
	color="sex"
	scales={{ x: { domain: [60, 85] } }}
/>
