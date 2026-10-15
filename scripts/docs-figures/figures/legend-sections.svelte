<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from '../data';
</script>

<LinePlot
	width={720}
	height={400}
	data={REGION_VALUES}
	x="year"
	y="value"
	color="region"
	legend={[
		{
			type: 'discrete',
			title: 'Region',
			interactive: { enabled: true },
			items: [
				{ name: 'North', color: '#4f46e5', symbol: 'line' },
				{ name: 'Center', color: '#e6580d', symbol: 'line' },
				{ name: 'South', color: '#16a34a', symbol: 'line' }
			]
		},
		{ type: 'continuous', title: 'Share', min: 0, max: 100, scheme: 'blues' }
	]}
/>
