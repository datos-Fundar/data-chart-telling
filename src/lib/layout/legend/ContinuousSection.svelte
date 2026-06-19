<script lang="ts">
  import type { ContinuousLegendSection } from '$lib/types/charts/legend';
  import { makeColorScale } from '$lib/utils/color';
  import { getConfiguration } from '$lib/configuration/config.svelte';

  let { section }: { section: ContinuousLegendSection } = $props();

  const cfg = $derived(getConfiguration());
  const gradientId = `dct-grad-${Math.random().toString(36).slice(2)}`;
  const barWidth = $derived(section.width ?? 170);
  const colorScale = $derived(
    makeColorScale(
      section.min,
      section.max,
      section.colorMin ?? cfg.continuous.min,
      section.colorMax ?? cfg.continuous.max,
    ),
  );

  const fmt = $derived(section.format ?? ((v: number) => String(v)));

  const tickPositions = $derived(
    (section.ticks ?? []).map((v) => ({
      v,
      t: (v - section.min) / (section.max - section.min || 1),
      label: fmt(v),
    })),
  );

  const stops = $derived(
    Array.from({ length: 20 }, (_, i) => {
      const t = i / 19;
      const v = section.min + t * (section.max - section.min);
      return { offset: t * 100, color: colorScale(v) };
    }),
  );
</script>

<div class="dct-continuous" style:width="{barWidth}px">
  <svg width={barWidth} height="20" style="overflow: visible">
    <defs>
      <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
        {#each stops as s (s.offset)}
          <stop offset="{s.offset}%" stop-color={s.color} />
        {/each}
      </linearGradient>
    </defs>
    <rect width={barWidth} height="12" rx="2" fill="url(#{gradientId})" />
    {#each tickPositions as tick (tick.v)}
      <line
        x1={tick.t * barWidth}
        y1="12"
        x2={tick.t * barWidth}
        y2="18"
        stroke="currentColor"
        stroke-width="1"
      />
    {/each}
  </svg>

  <div class="dct-continuous__labels" style:width="{barWidth}px">
    <span class="dct-continuous__edge dct-continuous__edge--start">{fmt(section.min)}</span>
    {#each tickPositions as tick (tick.v)}
      <span class="dct-continuous__tick" style:left="{tick.t * barWidth}px">{tick.label}</span>
    {/each}
    <span class="dct-continuous__edge dct-continuous__edge--end">{fmt(section.max)}</span>
  </div>
</div>

<style>
  .dct-continuous {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .dct-continuous__labels {
    position: relative;
    height: 1rem;
    font-size: var(--dct-legend-size, 0.75rem);
    user-select: none;
  }
  .dct-continuous__edge {
    position: absolute;
  }
  .dct-continuous__edge--start {
    left: 0;
  }
  .dct-continuous__edge--end {
    right: 0;
  }
  .dct-continuous__tick {
    position: absolute;
    transform: translateX(-50%);
  }
</style>
