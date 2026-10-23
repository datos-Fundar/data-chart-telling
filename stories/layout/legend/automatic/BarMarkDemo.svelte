<script lang="ts">
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import { LIFE } from '$datasets';
</script>

<!-- A bar plot's series show as a swatch. -->
<BarPlot width={760} height={360} data={LIFE} x="year" y="value" color="sex" />
