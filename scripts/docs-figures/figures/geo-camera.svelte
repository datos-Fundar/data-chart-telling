<script lang="ts">
	import { GeoPlot } from '@fundar/data-chart-telling';
	import { ARGENTINA_PROVINCES } from '../../../stories/plots/geo/data';
</script>

<GeoPlot
	width={480}
	height={520}
	data={ARGENTINA_PROVINCES}
	featureId={(f) => String(f.properties?.nombre)}
	coordinates={{
		projection: 'mercator',
		camera: {
			target: { features: ['Neuquén', 'Río Negro', 'Chubut'] },
			zoom: 1,
			anchor: 'middle-middle',
			padding: 24
		}
	}}
	styles={{ fill: '#e5e7eb', stroke: '#9ca3af' }}
	segments={{
		Neuquén: [{ styles: { fill: '#3b82f6' } }],
		'Río Negro': [{ styles: { fill: '#60a5fa' } }],
		Chubut: [{ styles: { fill: '#93c5fd' } }]
	}}
/>
