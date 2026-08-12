<script lang="ts">
  import { Geo } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { greatCircleInterpolate } from '$lib/plots/utils/geoAccessors';
  import type { GeoLinkMarkerConfig } from '$lib/types/markers/geo';

  /** Renders one `'link'` marker — geodesic-aware lines between point pairs, as a synthetic `LineString` fed through `<Geo>`. */
  let { marker }: { marker: GeoLinkMarkerConfig } = $props();

  const getX1 = $derived(resolveAccessor(marker.x1));
  const getY1 = $derived(resolveAccessor(marker.y1));
  const getX2 = $derived(resolveAccessor(marker.x2));
  const getY2 = $derived(resolveAccessor(marker.y2));

  const linkFeatures = $derived(
    marker.data.map((d) => ({
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates:
          marker.curve === 'linear'
            ? [
                [Number(getX1(d)), Number(getY1(d))],
                [Number(getX2(d)), Number(getY2(d))],
              ]
            : greatCircleInterpolate(Number(getX1(d)), Number(getY1(d)), Number(getX2(d)), Number(getY2(d))),
      },
    })),
  );
</script>

<!-- No `fill` prop: svelteplot treats any string as scale-worthy unless it's a real CSS color, so a literal `'none'` would run through the color scale instead of staying unfilled. Omitting it leaves svelteplot's own unfilled default in place. -->
<Geo
  class="link"
  data={linkFeatures}
  stroke={marker.style?.stroke ?? 'currentColor'}
  strokeWidth={marker.style?.strokeWidth ?? 1}
  strokeOpacity={marker.style?.strokeOpacity}
  strokeDasharray={marker.style?.strokeDasharray}
  style="vector-effect: non-scaling-stroke"
/>
