<script lang="ts">
	import { ViolinPlot } from '@fundar/data-chart-telling';
	import { IRIS } from './datasets';
</script>

<!-- The sepal length of the flowers of each species: its density, mirrored, with a box inside. -->
<ViolinPlot
	width={720}
	height={400}
	data={IRIS}
	x="species"
	y="sepalLength"
	scales={{ y: { label: 'Sepal length (cm)' } }}
/>
