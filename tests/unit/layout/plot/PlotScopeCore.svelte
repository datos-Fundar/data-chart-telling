<script lang="ts">
	let {
		markers = [],
		segments = {},
		facetLabel
	}: {
		markers?: { id: string }[];
		segments?: Record<string, { id: string }[]>;
		facetLabel?: string;
	} = $props();
</script>

<div
	data-testid="core"
	data-markers={markers.map((m) => m.id).join(',')}
	data-segments={Object.entries(segments)
		.map(([series, list]) => `${series}:${list.map((s) => s.id).join('+')}`)
		.join(',')}
	data-leaked={markers.some((m) => 'facet' in m) ||
		Object.values(segments).some((list) => list.some((s) => 'facet' in s))}
>
	{facetLabel}
</div>
