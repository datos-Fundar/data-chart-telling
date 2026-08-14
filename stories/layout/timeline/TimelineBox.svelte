<script lang="ts">
  import Timeline from '$lib/layout/timeline/Timeline.svelte';
  import type { Orientation, TimeValue } from '$lib/types/layout/timeline';

  /**
   * Plain wrapper that gives `Timeline` an explicitly CSS-sized box to render
   * into. svelteplot's `Plot` measures its own `<figure>`'s `clientWidth` for
   * the SVG `viewBox` even when an explicit `width` prop is set — without a
   * matching CSS box, the figure picks up the ambient container width instead
   * (here, the full Storybook canvas) and the chart renders squeezed into a
   * tiny corner. Every real usage in this library (`TimelineLayout`, the
   * chart kinds' internal gutters) already wraps `Timeline` this way; a bare
   * standalone story needs to do the same.
   */
  let {
    currentValue,
    values,
    orientation = 'vertical',
    width,
    height,
  }: {
    currentValue: TimeValue;
    values: TimeValue[];
    orientation?: Orientation;
    width: number;
    height: number;
  } = $props();
</script>

<div style:width="{width}px" style:height="{height}px">
  <Timeline {currentValue} {values} {orientation} {width} {height} />
</div>
