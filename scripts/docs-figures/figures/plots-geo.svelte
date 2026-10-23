<script lang="ts">
	import { GeoPlot, argentinaBicontinental } from '@fundar/data-chart-telling';
	import { ARGENTINA_PROVINCES } from '$datasets/argentina-provinces';
</script>

<GeoPlot
	width={480}
	height={520}
	data={ARGENTINA_PROVINCES}
	featureId={(feature) => String(feature.properties?.nombre)}
	color={(feature) => Number(feature.properties?.population)}
	scales={{ color: { scheme: 'blues' } }}
	coordinates={{ projection: { type: argentinaBicontinental } }}
/>
