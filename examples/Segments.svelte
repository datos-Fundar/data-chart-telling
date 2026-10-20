<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import type { LineSegmentStyle, SegmentsConfig } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './data';

	// `segments` maps a series name (or 'default' for all series) to its rules.
	const segments = {
		default: [
			{
				areas: [{ x: { from: new Date('2025-01-01'), to: new Date('2026-08-01') } }],
				styles: { stroke: { strokeDasharray: '6 4', strokeOpacity: 0.7 } }
			}
		]
	} satisfies SegmentsConfig<LineSegmentStyle>;
</script>

<LinePlot
	width={720}
	height={400}
	data={REGION_VALUES}
	x="date"
	y="value"
	color="region"
	{segments}
/>
