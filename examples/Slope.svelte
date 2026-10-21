<script lang="ts">
	import { SlopePlot } from '@fundar/data-chart-telling';
	import { AGE_SHARES } from './datasets';

	const censuses = AGE_SHARES.filter(({ year }) => year === 1991 || year === 2022);
</script>

<!-- Each age group's share of Buenos Aires City's population between two censuses, labelled at both ends. -->
<SlopePlot
	width={720}
	height={400}
	data={censuses}
	x="year"
	y="share"
	color="ageGroup"
	styles={{ values: { show: true } }}
/>
