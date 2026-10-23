<script module lang="ts">
	import type { CoordinatesConfig } from '$lib/types/layout/coordinates';

	export const SCENE_A = { features: ['Argentina', 'Chile', 'Uruguay', 'Paraguay', 'Bolivia'] };
	export const SCENE_B = { features: ['Japan'] };

	export const TRANSITION_START = 0.1;
	export const TRANSITION_END = 0.9;

	/** The `coordinates` this component feeds `<GeoPlot>` for a raw scroll fraction - exported for the story's docs source override. */
	export function coordinatesForScroll(raw: number): CoordinatesConfig {
		const inTransition = raw >= TRANSITION_START && raw < TRANSITION_END;
		const settledOnB = raw >= TRANSITION_END;
		const progress = (raw - TRANSITION_START) / (TRANSITION_END - TRANSITION_START);
		return {
			camera: {
				target: settledOnB || inTransition ? SCENE_B : SCENE_A,
				padding: 32,
				transition: inTransition
					? { progress, easing: 'quadOut' }
					: { duration: 400, easing: 'linear' }
			}
		};
	}
</script>

<script lang="ts">
	import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
	import { WORLD_COUNTRIES } from '$datasets/world-countries';

	/** `transition.progress` scrubbed from scroll position: settled on scene A, a transition band, then settled on B. */
	let { width = 940, height = 500 }: { width?: number; height?: number } = $props();

	let trackEl = $state<HTMLDivElement>();
	let raw = $state(0);

	/** Polled via `requestAnimationFrame` - native `scroll` events fire too unevenly for a smooth `progress`. */
	$effect(() => {
		const el = trackEl;
		if (!el) return;
		let raf: number;
		function tick() {
			const max = el!.scrollHeight - el!.clientHeight;
			raw = max > 0 ? Math.min(1, Math.max(0, el!.scrollTop / max)) : 0;
			raf = requestAnimationFrame(tick);
		}
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	const coordinates = $derived(coordinatesForScroll(raw));
</script>

<div
	class="scroll-track"
	style="height: {height}px; overflow-y: auto; border: 1px solid #cbd5e1;"
	bind:this={trackEl}
>
	<div style="height: {height * 3}px; position: relative;">
		<div style="position: sticky; top: 0;">
			<GeoPlot {width} {height} data={WORLD_COUNTRIES} {coordinates} />
			<p style="padding: 8px 16px; color: #475569;">
				Scroll this panel - settled on the Southern Cone, then a scrubbed move to Japan, then
				settled there.
			</p>
		</div>
	</div>
</div>
