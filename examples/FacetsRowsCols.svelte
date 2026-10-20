<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './data';

	// Each region's value split into two sectors.
	const SECTORS = [
		{ sector: 'Goods', share: 0.8 },
		{ sector: 'Services', share: 1.4 }
	];
	const rows = REGION_VALUES.flatMap((row) =>
		SECTORS.map(({ sector, share }) => ({ ...row, sector, value: row.value * share }))
	);
</script>

<!-- One panel per region and sector; `scales: 'free'` fits each panel to its own data. -->
<LinePlot
	width={720}
	height={420}
	data={rows}
	x="date"
	y="value"
	facet={{ rows: 'region', cols: 'sector', scales: 'free' }}
/>
