<script lang="ts">
	import { GeoPlot, argentinaBicontinental } from '@fundar/data-chart-telling';
	import { ARGENTINA_PROVINCES } from '../../../stories/plots/map/geo/data';
</script>

<GeoPlot
	width={480}
	height={520}
	data={ARGENTINA_PROVINCES}
	featureId={(feature) => String(feature.properties?.nombre)}
	coordinates={{ projection: { type: argentinaBicontinental } }}
	segments={{
		default: [{ styles: { fillOpacity: 0.7, stroke: '#94a3b8' } }],
		Mendoza: [{ styles: { fill: '#3b82f6', fillOpacity: 0.9 } }],
		Salta: [{ styles: { fill: '#ef4444', fillOpacity: 0.9 } }]
	}}
/>
