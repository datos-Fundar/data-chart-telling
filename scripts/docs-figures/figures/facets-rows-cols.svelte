<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from '../data';

	const rows = REGION_VALUES.flatMap((r) =>
		['Goods', 'Services'].map((sector, s) => ({ ...r, sector, value: r.value * (s ? 1.4 : 0.8) }))
	);
</script>

<LinePlot
	width={720}
	height={420}
	data={rows}
	x="year"
	y="value"
	facet={{ rows: 'region', cols: 'sector', scales: 'free' }}
/>
