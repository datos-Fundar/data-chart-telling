<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './datasets';

	// Each region's value split into two sectors.
	const SECTORS = [
		{ sector: 'Goods', share: 0.8 },
		{ sector: 'Services', share: 1.4 }
	];
	const rows = REGION_VALUES.flatMap((row) =>
		SECTORS.map(({ sector, share }) => ({ ...row, sector, value: row.value * share }))
	);
</script>

<!-- One panel per region. `facet` on a marker or a segment limits it to the panels it names: the rule is drawn in GBA only, and Services is dashed in Cuyo only. -->
<LinePlot
	width={900}
	height={360}
	data={rows}
	x="date"
	y="value"
	color="sector"
	facet={{ by: 'region', columns: 3 }}
	markers={[{ type: 'rule', axis: 'y', value: 10, facet: 'GBA' }]}
	segments={{ Services: [{ facet: 'Cuyo', styles: { stroke: { strokeDasharray: '4 4' } } }] }}
/>
