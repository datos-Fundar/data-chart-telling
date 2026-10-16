<script lang="ts">
	import { Contour } from 'svelteplot';
	import type { GeoContourMarkerConfig } from '$lib/types/markers/geo';

	/**
	 * Renders one `'contour'` marker's `<Contour>` mark. `marker.clip` is
	 * handled by the caller (`GeometryLayout` wraps this in `ContourClipMarker`)
	 * - this component only draws the contour itself.
	 */
	let { marker }: { marker: GeoContourMarkerConfig } = $props();
</script>

<!-- No `?? 'none'` fallback: an unset `fill` should leave svelteplot's own default (`fill="none"`) in place, not run the literal string `'none'` through the color scale. -->
<Contour
	class="contour"
	data={marker.data}
	x={marker.x}
	y={marker.y}
	value={marker.value}
	thresholds={marker.thresholds}
	fill={marker.fill}
	stroke={marker.stroke ?? 'currentColor'}
	strokeWidth={marker.styles?.strokeWidth}
	fillOpacity={marker.styles?.fillOpacity}
	strokeOpacity={marker.styles?.strokeOpacity}
	blur={marker.blur}
	interpolate={marker.interpolate}
/>
