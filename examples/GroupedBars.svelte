<script lang="ts">
	import { BarPlot } from '@fundar/data-chart-telling';
	import { PROVINCE_VALUES } from './datasets';
</script>

<!-- Vertical bars, grouped by `color`. -->
<BarPlot
	width={720}
	height={400}
	data={PROVINCE_VALUES}
	x="province"
	y="value"
	color="sex"
	scales={{ y: { domain: [70, 85] } }}
/>
