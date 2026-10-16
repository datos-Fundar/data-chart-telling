<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import type { LineSegmentStyle, SegmentsConfig } from '@fundar/data-chart-telling';
	import { ROWS } from './data';

	// `segments` maps a series name (or 'default' for all series) to its rules.
	const segments = {
		default: [
			{
				areas: [{ x: { from: 2020, to: 2023 } }],
				styles: { stroke: { strokeDasharray: '6 4', strokeOpacity: 0.7 } }
			}
		]
	} satisfies SegmentsConfig<LineSegmentStyle>;
</script>

<LinePlot width={720} height={400} data={ROWS} x="year" y="value" color="region" {segments} />
