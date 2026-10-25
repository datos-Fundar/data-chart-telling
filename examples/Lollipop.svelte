<script lang="ts">
	import { LollipopPlot } from '@fundar/data-chart-telling';
	import { PROVINCE_VALUES } from './datasets';

	const female = PROVINCE_VALUES.filter((row) => row.sex === 'female');
</script>

<!-- One dot on a stem per province: female life expectancy at birth, with its value beside it. -->
<LollipopPlot
	width={720}
	height={400}
	data={female}
	x="value"
	y="province"
	scales={{ x: { domain: [70, 85] } }}
	styles={{ values: { show: true } }}
/>
