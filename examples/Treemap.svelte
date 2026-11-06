<script lang="ts">
	import { TreemapPlot } from '@fundar/data-chart-telling';
	import { ACTIVITY_BRANCHES } from './datasets';
</script>

<!-- One tile per branch, sized by its value and colored by its sector. -->
<TreemapPlot
	width={760}
	height={440}
	data={ACTIVITY_BRANCHES}
	value="value"
	grouping="sector.branch"
/>
