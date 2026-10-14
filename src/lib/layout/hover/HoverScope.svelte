<script lang="ts">
	import { HoverState } from '$lib/layout/hover/HoverState.svelte';
	import type { Snippet } from 'svelte';

	/** Gives every plot rendered inside its own hover scope - see {@link HoverState.provideScope}. */
	let { id, children }: { id: string; children: Snippet } = $props();

	HoverState.provideScope(() => id);
</script>

{@render children()}
