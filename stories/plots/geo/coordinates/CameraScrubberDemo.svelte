<script module lang="ts">
	import type { CoordinatesConfig } from '$lib/types/layout/coordinates';

	export const SCENE_A = { features: ['Argentina', 'Chile', 'Uruguay', 'Paraguay', 'Bolivia'] };
	export const SCENE_B = { features: ['Japan'] };

	/** The `coordinates` this component feeds `<GeoPlot>` for a given `progress` — exported for the story's docs source override. `target` flips once, at `progress === 0`. */
	export function coordinatesForProgress(progress: number): CoordinatesConfig {
		return {
			camera: {
				target: progress <= 0 ? SCENE_A : SCENE_B,
				zoom: 1,
				padding: 32,
				transition: { progress, easing: 'quadOut' }
			}
		};
	}
</script>

<script lang="ts">
	import GeoPlot from '$lib/plots/geo/Plot.svelte';
	import Scrubber from '../../../common/Scrubber.svelte';
	import { WORLD_COUNTRIES } from '../data';

	/** `transition.progress` driven by a range input, standing in for scroll/a timeline/etc. */
	let { width = 940, height = 500 }: { width?: number; height?: number } = $props();
</script>

<Scrubber initial={0}>
	{#snippet children({ progress })}
		<GeoPlot
			{width}
			{height}
			data={WORLD_COUNTRIES}
			coordinates={coordinatesForProgress(progress)}
		/>
	{/snippet}
</Scrubber>
