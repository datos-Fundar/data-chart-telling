<script lang="ts">
	import { DumbbellPlot } from '@fundar/data-chart-telling';
	import { PROVINCE_VALUES } from './data';
</script>

<!-- Two dots per province, one per sex, joined by a connector: the gap in life expectancy at birth. -->
<DumbbellPlot
	width={720}
	height={400}
	data={PROVINCE_VALUES}
	x="value"
	y="province"
	color="sex"
	scales={{ x: { domain: [70, 85] } }}
	styles={{ values: { show: true } }}
/>
