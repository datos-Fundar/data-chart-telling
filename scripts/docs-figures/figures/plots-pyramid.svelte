<script lang="ts">
	import { PyramidPlot } from '@fundar/data-chart-telling';
	import { AGES } from '../data';
</script>

<PyramidPlot width={720} height={400} data={AGES} x="share" y="ageGroup" color="sex" />
