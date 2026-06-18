<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { Plot, BarY, AxisX, AxisY, Pointer } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils';
  import { getConfiguration } from '$lib/charts/config.svelte';
  import { getHover, createHover } from '$lib/charts/hover.svelte';
  import { createHoverController } from '$lib/charts/tooltip/controller.svelte';
  import HoverMarks from '$lib/charts/tooltip/HoverMarks.svelte';
  import Tooltip from '$lib/charts/tooltip/Tooltip.svelte';
  import type { BarSeries } from '$lib/types/plots/bars';
  import type { XValue } from '$lib/types/plots/common';
  import type { TooltipRuntime } from '$lib/types/charts/tooltip';

  let {
    width,
    height,
    series,
    tooltip = undefined,
  }: {
    width: number;
    height: number;
    series: BarSeries<TData>[];
    tooltip?: TooltipRuntime<TData>;
  } = $props();

  const cfg = $derived(getConfiguration());

  // ── Hover / tooltip ───────────────────────────────────────────────────────
  const sharedHover = getHover();
  const localHover = createHover();
  const hover = $derived(sharedHover ?? localHover);
  $effect(() => {
    if (!sharedHover && tooltip) localHover.sync = tooltip.sync;
  });

  const xAcc = $derived(resolveAccessor(series[0]?.x ?? ((d: TData) => d)));
  const yAcc = $derived(resolveAccessor(series[0]?.y ?? ((d: TData) => d)));
  const flat = $derived(series.flatMap((s) => s.data));
  const hoverPoints = $derived(
    flat.map((d) => ({ x: xAcc(d) as XValue, y: Number(yAcc(d)), row: d, label: String(yAcc(d)) })),
  );

  const ctrl = createHoverController<TData>({
    hover: () => hover,
    facetId: () => tooltip?.facetId ?? '',
    points: () => hoverPoints,
    getX: () => (d) => xAcc(d) as XValue,
    getY: () => (d) => Number(yAcc(d)),
    label: () => (r) => String(yAcc(r)),
    format: () => tooltip?.format ?? ((r) => String(yAcc(r))),
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dct-plot"
  style:color={cfg.axis.color}
  onpointermove={tooltip ? ctrl.onMove : undefined}
  onpointerleave={tooltip ? ctrl.onLeave : undefined}
>
<Plot
  {width}
  {height}
  margin={cfg.margins}
  x={{ type: 'band', padding: 0.2 }}
>
  <AxisX tickSize={cfg.axis.tickSize} tickPadding={cfg.axis.tickPadding} tickFontSize={cfg.axis.fontSize} />
  <AxisY tickSize={0} tickPadding={cfg.axis.tickPadding} tickFontSize={cfg.axis.fontSize} />

  {#each series as s (s.name)}
    <BarY
      data={s.data}
      x={resolveAccessor(s.x)}
      y={resolveAccessor(s.y)}
      fill={s.fill}
      fillOpacity={s.fillOpacity ?? 1}
    />
  {/each}

  {#if tooltip}
    <Pointer data={flat} x={xAcc} maxDistance={400} onupdate={ctrl.onPointer} />
    <HoverMarks points={ctrl.points} ruleX={ctrl.ruleX} ruleY={ctrl.ruleY} color={cfg.timeline.activeColor} />
  {/if}
</Plot>

{#if tooltip && ctrl.showTooltip && ctrl.cursor}
  <Tooltip x={ctrl.cursor.x} y={ctrl.cursor.y}>{ctrl.tooltipText}</Tooltip>
{/if}
</div>

<style>
  .dct-plot {
    position: relative;
    line-height: 0;
  }
</style>
