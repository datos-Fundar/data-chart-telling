<script lang="ts">
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import { LIFE_EXPECTANCY } from '../../../plots/line/data';
</script>

<!-- A line plot's series show as their stroke. -->
<LinePlot width={760} height={360} data={LIFE_EXPECTANCY} x="year" y="value" color="sex" />
