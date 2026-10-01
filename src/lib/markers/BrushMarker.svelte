<script lang="ts">
	import { Brush } from 'svelteplot';
	import type { BrushMarkerConfig, BrushSelection } from '$lib/types/markers/common';

	/**
	 * Renders one `'brush'` marker as `<Brush>`. svelteplot's `Brush` binds its
	 * selection, so this wrapper owns that state (seeded once from
	 * `marker.brush`) and surfaces changes through the `onbrush*` callbacks.
	 * svelteplot's `Brush` spreads its props over its defaults, so an explicit
	 * `undefined` would erase them — each default is restated here instead.
	 */
	let { marker }: { marker: BrushMarkerConfig } = $props();

	// svelte-ignore state_referenced_locally
	let brush = $state<BrushSelection>(marker.brush ?? { enabled: false });
</script>

<Brush
	bind:brush
	limitDimension={marker.limitDimension ?? false}
	constrainToDomain={marker.constrainToDomain ?? false}
	resizeHandleSize={marker.resizeHandleSize ?? 10}
	onbrushstart={marker.onbrushstart}
	onbrush={marker.onbrush}
	onbrushend={marker.onbrushend}
	stroke={marker.styles?.stroke ?? 'currentColor'}
	strokeWidth={marker.styles?.strokeWidth}
	strokeOpacity={marker.styles?.strokeOpacity ?? 0.6}
	strokeDasharray={marker.styles?.strokeDasharray ?? '2,3'}
	strokeLinecap={marker.styles?.strokeLinecap}
	strokeLinejoin={marker.styles?.strokeLinejoin}
/>
