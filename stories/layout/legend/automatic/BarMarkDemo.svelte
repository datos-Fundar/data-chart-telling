<script lang="ts">
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import { LIFE_EXPECTANCY } from '../../../plots/line/data';
</script>

<!-- A bar plot's series show as a swatch. -->
<BarPlot width={760} height={360} data={LIFE_EXPECTANCY} x="year" y="value" color="sex" />
