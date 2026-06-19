<script lang="ts" generics="TRow extends Record<string, unknown>">
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import Timeline from '$lib/layout/timeline/Timeline.svelte';
  import type {
    Orientation,
    TimeValue,
    TimelineChildSnippet,
  } from '$lib/types/charts/common';
  import type { Accessor } from '$lib/types/plots/common';

  /**
   * Couples a scrubber `progress` to a discrete sequence of time steps. It picks
   * the selected step, filters the data down to it, splits the available box
   * between the plot and the timeline gutter, and renders both. The plot itself
   * is supplied as the `child` snippet, so this layout is plot-agnostic.
   */
  let {
    data,
    accessor,
    progress,
    values,
    orientation = 'vertical',
    thickness = 60,
    filterMode = 'exact',
    width,
    height,
    child,
  }: {
    data: TRow[];
    accessor: Accessor<TRow, TimeValue>;
    progress: number;
    values?: TimeValue[];
    orientation?: Orientation;
    thickness?: number;
    filterMode?: 'exact' | 'upTo';
    width: number;
    height: number;
    child: TimelineChildSnippet<TRow>;
  } = $props();

  const getTime = $derived(resolveAccessor<TRow>(accessor));

  const steps = $derived.by(() => {
    if (values?.length) return [...values].sort((a, b) => a - b);
    return [...new Set(data.map(getTime))].sort((a, b) => a - b);
  });

  const selectedValue = $derived.by(() => {
    if (!steps.length) return 0;
    const idx = Math.min(
      steps.length - 1,
      Math.max(0, Math.round(progress * (steps.length - 1))),
    );
    return steps[idx];
  });

  const filtered = $derived(
    filterMode === 'upTo'
      ? data.filter((d) => getTime(d) <= selectedValue)
      : data.filter((d) => getTime(d) === selectedValue),
  );

  const isVertical = $derived(orientation === 'vertical');
  const gap = 12;
  const innerWidth = $derived(
    Math.max(0, isVertical ? width - thickness - gap : width),
  );
  const innerHeight = $derived(
    Math.max(0, isVertical ? height : height - thickness - gap),
  );
</script>

{#if isVertical}
  <div class="dct-timeline dct-timeline--vertical" style:width="{width}px" style:height="{height}px">
    <div class="dct-timeline__plot">
      {@render child({ selectedValue, data: filtered, width: innerWidth, height: innerHeight })}
    </div>
    <div class="dct-timeline__gutter" style:width="{thickness}px">
      <Timeline currentValue={selectedValue} values={steps} orientation="vertical" width={thickness} height={innerHeight} />
    </div>
  </div>
{:else}
  <div class="dct-timeline dct-timeline--horizontal" style:width="{width}px" style:height="{height}px">
    <div class="dct-timeline__plot">
      {@render child({ selectedValue, data: filtered, width: innerWidth, height: innerHeight })}
    </div>
    <div class="dct-timeline__gutter" style:height="{thickness}px">
      <Timeline currentValue={selectedValue} values={steps} orientation="horizontal" width={innerWidth} height={thickness} />
    </div>
  </div>
{/if}

<style>
  .dct-timeline {
    display: flex;
  }
  .dct-timeline--vertical {
    flex-direction: row;
    gap: 12px;
  }
  .dct-timeline--horizontal {
    flex-direction: column;
    gap: 12px;
  }
  .dct-timeline__plot {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
  }
  .dct-timeline__gutter {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
