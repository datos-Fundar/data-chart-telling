<script lang="ts" generics="TRow extends Record<string, unknown>">
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import Timeline from '$lib/layout/timeline/Timeline.svelte';
  import { resolveEasing, interpolateSeries } from '$lib/utils/interpolate';
  import type {
    Orientation,
    TimeValue,
    TimelineChildSnippet,
    TimelineInterpolation,
  } from '$lib/types/layout/timeline';
  import type { Accessor } from '$lib/types/plots/data/common';

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
    show = true,
    thickness = 60,
    filterMode = 'exact',
    interpolate,
    width,
    height,
    child,
  }: {
    data: TRow[];
    accessor: Accessor<TRow, TimeValue>;
    progress: number;
    values?: TimeValue[];
    orientation?: Orientation;
    show?: boolean;
    thickness?: number;
    filterMode?: 'exact' | 'upTo';
    interpolate?: TimelineInterpolation<TRow>;
    width: number;
    height: number;
    child: TimelineChildSnippet<TRow>;
  } = $props();

  const getTime = $derived(resolveAccessor<TRow>(accessor));

  const steps = $derived.by(() => {
    if (values?.length) return [...values].sort((a, b) => a - b);
    return [...new Set(data.map(getTime))].sort((a, b) => a - b);
  });

  const progressEasingFn = $derived(resolveEasing(interpolate?.progressEasing));
  const segmentEasingFn = $derived(resolveEasing(interpolate?.segmentEasing));

  /** Continuous scrub position across the full step domain — only meaningful when `interpolate` is set. */
  const currentTime = $derived.by(() => {
    if (!steps.length) return 0;
    const t0 = steps[0];
    const t1 = steps[steps.length - 1];
    return t0 + (t1 - t0) * progressEasingFn(progress);
  });

  const selectedValue = $derived.by(() => {
    if (!steps.length) return 0;
    if (interpolate) {
      return steps.reduce((best, s) =>
        Math.abs(s - currentTime) < Math.abs(best - currentTime) ? s : best,
      );
    }
    const idx = Math.min(
      steps.length - 1,
      Math.max(0, Math.round(progress * (steps.length - 1))),
    );
    return steps[idx];
  });

  function defaultCreate(_lower: TRow, upper: TRow, x: TimeValue, value: number): TRow {
    const valueField = interpolate?.value;
    if (typeof accessor !== 'string' || typeof valueField !== 'string') {
      console.warn(
        'TimelineLayout: cannot auto-build an interpolated row when `accessor` or `interpolate.value` is a function — pass `interpolate.create` explicitly.',
      );
      return upper;
    }
    return { ...upper, [accessor]: x, [valueField]: value } as TRow;
  }

  const filtered = $derived.by(() => {
    const discrete = () =>
      filterMode === 'upTo'
        ? data.filter((d) => getTime(d) <= selectedValue)
        : data.filter((d) => getTime(d) === selectedValue);

    if (!interpolate) return discrete();
    if (!interpolate.value) {
      console.warn('TimelineLayout: `interpolate.value` is required to tween — falling back to discrete filtering.');
      return discrete();
    }

    const getKey = resolveAccessor<TRow>(interpolate.key ?? (() => '__all__'));
    const getValue = resolveAccessor<TRow>(interpolate.value) as (d: TRow) => number;
    const create = interpolate.create ?? defaultCreate;

    const groups = new Map<string, TRow[]>();
    for (const row of data) {
      const key = String(getKey(row));
      const bucket = groups.get(key);
      if (bucket) bucket.push(row);
      else groups.set(key, [row]);
    }

    const result: TRow[] = [];
    for (const rows of groups.values()) {
      const tweened = interpolateSeries({
        rows,
        x: currentTime,
        getTime,
        getValue,
        create,
        segmentEasing: segmentEasingFn,
      });
      if (filterMode === 'upTo') result.push(...tweened);
      else if (tweened.length) result.push(tweened[tweened.length - 1]);
    }
    return result;
  });

  const isVertical = $derived(orientation === 'vertical');
  const gap = $derived(show ? 12 : 0);
  const effectiveThickness = $derived(show ? thickness : 0);
  const innerWidth = $derived(
    Math.max(0, isVertical ? width - effectiveThickness - gap : width),
  );
  const innerHeight = $derived(
    Math.max(0, isVertical ? height : height - effectiveThickness - gap),
  );
</script>

{#if isVertical}
  <div class="dct-timeline dct-timeline--vertical" style:width="{width}px" style:height="{height}px" style:gap="{gap}px">
    <div class="dct-timeline__plot">
      {@render child({ selectedValue, data: filtered, width: innerWidth, height: innerHeight })}
    </div>
    {#if show}
      <div class="dct-timeline__gutter" style:width="{thickness}px">
        <Timeline currentValue={selectedValue} values={steps} orientation="vertical" width={thickness} height={innerHeight} />
      </div>
    {/if}
  </div>
{:else}
  <div class="dct-timeline dct-timeline--horizontal" style:width="{width}px" style:height="{height}px" style:gap="{gap}px">
    <div class="dct-timeline__plot">
      {@render child({ selectedValue, data: filtered, width: innerWidth, height: innerHeight })}
    </div>
    {#if show}
      <div class="dct-timeline__gutter" style:height="{thickness}px">
        <Timeline currentValue={selectedValue} values={steps} orientation="horizontal" width={innerWidth} height={thickness} />
      </div>
    {/if}
  </div>
{/if}

<style>
  .dct-timeline {
    display: flex;
  }
  .dct-timeline--vertical {
    flex-direction: row;
  }
  .dct-timeline--horizontal {
    flex-direction: column;
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
