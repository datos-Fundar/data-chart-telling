<script lang="ts">
	import { getContext, setContext, type Snippet } from 'svelte';
	import { ScaleFreeContext, type SvelteplotContext } from './ScaleFreeContext';

	/**
	 * Draws its markers on the plot's scales without them taking part in the scales: what changes at every move of
	 * the pointer - the hover's markers - never makes svelteplot work out the scales again. See `ScaleFreeContext`.
	 */
	let { children }: { children: Snippet } = $props();

	setContext('svelteplot', ScaleFreeContext.of(getContext<SvelteplotContext>('svelteplot')));
</script>

{@render children()}
