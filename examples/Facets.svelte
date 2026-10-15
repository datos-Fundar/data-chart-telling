<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { ROWS } from './data';
</script>

<!-- One panel per region, three columns, sharing scales. A tooltip with `sync` shows in every panel on purpose. -->
<LinePlot
	width={900}
	height={360}
	data={ROWS}
	x="year"
	y="value"
	facet={{ by: 'region', columns: 3, gap: 12, scales: 'shared' }}
	tooltip={{ sync: true }}
/>
