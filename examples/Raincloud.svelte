<script lang="ts">
	import { RaincloudPlot } from '@fundar/data-chart-telling';
	import { IRIS } from './datasets/iris-flower';
</script>

<!-- The sepal length of the flowers of each species: half its density, a box, and every flower as a dot. -->
<RaincloudPlot
	width={720}
	height={400}
	data={IRIS}
	x="species"
	y="sepalLength"
	scales={{ y: { label: 'Sepal length (cm)' } }}
/>
