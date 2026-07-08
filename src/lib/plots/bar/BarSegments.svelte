<script lang="ts" generics="TData extends Record<string, unknown>">
  import { BarX, BarY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import type { Series } from '$lib/types/plots/common';
  import type { BarSegmentStyle, VisualGroup } from '$lib/types/plots/styles';
  import type { BarLayout } from './layout.svelte';

  /**
   * Renders one series' bars — the `'stacked'` branch (cumulative baseline
   * from {@link BarLayout.stackedBaseline}) or the `'grouped'`/`'overlap'`
   * branch (per-segment insets from {@link BarLayout.seriesStep}/`seriesGap`).
   */
  let {
    group,
    seriesIndex,
    barLayout,
    isHorizontal,
    BarMark,
    defaultColor,
  }: {
    group: VisualGroup<Series<TData>, BarSegmentStyle>;
    seriesIndex: number;
    barLayout: BarLayout<TData>;
    isHorizontal: boolean;
    BarMark: typeof BarX | typeof BarY;
    defaultColor: string;
  } = $props();

  const xFn = $derived(resolveAccessor(group.series.x));
  const yFn = $derived(resolveAccessor(group.series.y));
</script>

{#if barLayout.layout === 'stacked'}
  {@const stackedBaselineFn = (d: TData) => barLayout.stackedBaseline(xFn(d), seriesIndex)}
  {@const stackedTopFn = (d: TData) => barLayout.stackedBaseline(xFn(d), seriesIndex) + Number(yFn(d))}
  <BarMark
    data={group.series.data}
    {...isHorizontal
      ? { y: xFn, x1: stackedBaselineFn, x2: stackedTopFn }
      : { x: xFn, y1: stackedBaselineFn, y2: stackedTopFn }}
    fill={defaultColor}
  />
{:else}
  {#each group.visualSegments as seg, i (`${group.series.name}-${i}`)}
    <BarMark
      data={seg.data}
      {...isHorizontal
        ? { y: xFn, x1: barLayout.valueBaseline, x2: yFn }
        : { x: xFn, y1: barLayout.valueBaseline, y2: yFn }}
      fill={seg.style.fill ?? defaultColor}
      fillOpacity={seg.style.fillOpacity ?? 1}
      {...barLayout.layout === 'grouped'
        ? isHorizontal
          ? {
              insetTop: seriesIndex * barLayout.seriesStep + barLayout.seriesGap / 2,
              insetBottom: (barLayout.seriesCount - 1 - seriesIndex) * barLayout.seriesStep + barLayout.seriesGap / 2,
            }
          : {
              insetLeft: seriesIndex * barLayout.seriesStep + barLayout.seriesGap / 2,
              insetRight: (barLayout.seriesCount - 1 - seriesIndex) * barLayout.seriesStep + barLayout.seriesGap / 2,
            }
        : {}}
    />
  {/each}
{/if}
