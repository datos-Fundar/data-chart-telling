<script lang="ts">
	import { getContext, setContext, type Snippet } from 'svelte';
	import { ScaleGate } from './ScaleGate.svelte';
	import type { SvelteplotContext } from './ScaleFreeContext';

	/**
	 * Hands every mark drawn under it to svelteplot's plot behind a gate: the plot works its scales out again when a
	 * mark's rows hold something new, not each time the mark copies them. See `ScaleGate`.
	 */
	let { children }: { children: Snippet } = $props();

	setContext('svelteplot', ScaleGate.of(getContext<SvelteplotContext>('svelteplot')));
</script>

{@render children()}
