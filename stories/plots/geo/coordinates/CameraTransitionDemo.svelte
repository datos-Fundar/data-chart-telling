<script module lang="ts">
	import type { CoordinatesConfig } from '$lib/types/layout/coordinates';

	export const SCENES = [
		{ label: 'Southern Cone', features: ['Argentina', 'Chile', 'Uruguay', 'Paraguay', 'Bolivia'] },
		{ label: 'Japan', features: ['Japan'] }
	] as const;

	/** The `coordinates` this component feeds `<GeoPlot>` - exported for the story's docs source override, see `stories/common/docsSource.ts`. */
	export function coordinatesForScene(sceneIndex: number, duration: number): CoordinatesConfig {
		return {
			camera: {
				target: { features: [...SCENES[sceneIndex].features] },
				padding: 32,
				transition: { duration, easing: 'cubicOut' }
			}
		};
	}
</script>

<script lang="ts">
	import GeoPlot from '$lib/plots/geo/Plot.svelte';
	import { WORLD_COUNTRIES } from '../data';

	/** A click swaps `camera.target`; `GeoPlot` auto-plays the move (no `transition.progress`). */
	let {
		width = 940,
		height = 500,
		duration = 1000
	}: { width?: number; height?: number; duration?: number } = $props();

	let sceneIndex = $state(0);
	const nextIndex = $derived((sceneIndex + 1) % SCENES.length);
	const coordinates = $derived(coordinatesForScene(sceneIndex, duration));
</script>

<button type="button" onclick={() => (sceneIndex = nextIndex)} style="margin-bottom: 8px;">
	Fly to {SCENES[nextIndex].label}
</button>
<GeoPlot {width} {height} data={WORLD_COUNTRIES} {coordinates} />
