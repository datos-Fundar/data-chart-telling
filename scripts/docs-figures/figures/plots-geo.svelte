<script lang="ts">
	import { GeoPlot, argentinaBicontinental } from '@fundar/data-chart-telling';
	import { ARGENTINA_PROVINCES } from '../../../stories/plots/geo/data';
</script>

<GeoPlot
	width={480}
	height={520}
	data={ARGENTINA_PROVINCES}
	featureId={(f) => String(f.properties?.nombre)}
	color={(f) => Number(f.properties?.population)}
	scales={{ color: { scheme: 'blues' } }}
	coordinates={{ projection: { type: argentinaBicontinental } }}
/>
