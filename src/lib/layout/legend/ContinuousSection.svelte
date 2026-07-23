<script lang="ts">
  import { untrack } from 'svelte';
  import type { ContinuousLegendSection } from '$lib/types/charts/legend';
  import { makeColorScale } from '$lib/utils/color';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { getLegendInteraction, createLegendInteraction } from '$lib/layout/legend/interaction.svelte';

  let { section }: { section: ContinuousLegendSection } = $props();

  const cfg = $derived(getConfiguration());
  const gradientId = `dct-grad-${Math.random().toString(36).slice(2)}`;
  const barWidth = $derived(section.width ?? 170);

  const fmt = $derived(section.format ?? ((v: number) => String(v)));

  const tickPositions = $derived(
    section.interactive
      ? []
      : (section.ticks ?? []).map((v) => ({
          v,
          t: (v - section.min) / (section.max - section.min || 1),
          label: fmt(v),
        })),
  );

  // ── Drag-to-narrow-margins ────────────────────────────────────────────────
  const interaction = getLegendInteraction() ?? createLegendInteraction();

  // Seeded once from the section's own bounds (deliberately untracked — a
  // later `section.min`/`max` change re-clamps the existing lo/hi instead of
  // resetting them back out to the new full range, see below).
  let lo = $state(untrack(() => section.min));
  let hi = $state(untrack(() => section.max));

  // `section.min`/`max` can shift under an already-active selection — e.g. a
  // consumer swaps `data` for a different year on its own timeline, and the
  // value that used to be the max is no longer present. Re-clamping (instead
  // of leaving lo/hi at their old absolute values) keeps the handles inside
  // whatever range now actually exists: the lower handle can only move up to
  // meet a risen min, the upper handle can only move down to meet a fallen
  // max. Clamping each bound against *both* of the new min/max first (not
  // just its own side) keeps lo/hi from inverting if the domain shifts
  // entirely past the old selection.
  $effect(() => {
    lo = Math.min(Math.max(lo, section.min), section.max);
    hi = Math.max(Math.min(hi, section.max), section.min);
  });

  function toT(v: number): number {
    return (v - section.min) / (section.max - section.min || 1);
  }
  const loT = $derived(toT(lo));
  const hiT = $derived(toT(hi));

  const colorDomain = $derived.by((): [number, number] =>
    section.interactive && (section.mode ?? 'filter') === 'rescale' ? [lo, hi] : [section.min, section.max],
  );
  const colorScale = $derived(
    makeColorScale(
      colorDomain[0],
      colorDomain[1],
      section.colorMin ?? cfg.continuous.min,
      section.colorMax ?? cfg.continuous.max,
    ),
  );

  const stops = $derived(
    Array.from({ length: 20 }, (_, i) => {
      const t = i / 19;
      const v = section.min + t * (section.max - section.min);
      return { offset: t * 100, color: colorScale(v) };
    }),
  );

  $effect(() => {
    if (!section.interactive) return;
    interaction.continuousRange =
      lo <= section.min && hi >= section.max
        ? null
        : {
            min: lo,
            max: hi,
            mode: section.mode ?? 'filter',
            disabledStyle: section.disabledStyle ?? { opacity: cfg.legend.disabledOpacity },
          };
  });

  function startDrag(which: 'lo' | 'hi') {
    return (event: PointerEvent) => {
      if (!section.interactive) return;
      event.preventDefault();
      const target = event.currentTarget as SVGElement;
      target.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      const startValue = which === 'lo' ? lo : hi;
      const valuePerPixel = (section.max - section.min) / barWidth;

      function onMove(e: PointerEvent): void {
        const next = startValue + (e.clientX - startX) * valuePerPixel;
        if (which === 'lo') {
          lo = Math.max(section.min, Math.min(next, hi));
        } else {
          hi = Math.min(section.max, Math.max(next, lo));
        }
      }
      function onUp(e: PointerEvent): void {
        target.releasePointerCapture(e.pointerId);
        target.removeEventListener('pointermove', onMove);
        target.removeEventListener('pointerup', onUp);
        target.removeEventListener('pointercancel', onUp);
      }
      target.addEventListener('pointermove', onMove);
      target.addEventListener('pointerup', onUp);
      target.addEventListener('pointercancel', onUp);
    };
  }

  function resetHandle(which: 'lo' | 'hi') {
    return () => {
      if (which === 'lo') lo = section.min;
      else hi = section.max;
    };
  }
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

    {#if section.interactive}
      {#if loT > 0}
        <rect x="0" y="0" width={loT * barWidth} height="12" rx="2" fill="currentColor" fill-opacity="0.35" />
      {/if}
      {#if hiT < 1}
        <rect x={hiT * barWidth} y="0" width={barWidth - hiT * barWidth} height="12" rx="2" fill="currentColor" fill-opacity="0.35" />
      {/if}
      <circle
        class="dct-continuous__handle"
        cx={loT * barWidth}
        cy="6"
        r="6"
        onpointerdown={startDrag('lo')}
        ondblclick={resetHandle('lo')}
        role="slider"
        aria-label="Margen inferior"
        aria-valuemin={section.min}
        aria-valuemax={hi}
        aria-valuenow={lo}
        tabindex="0"
      />
      <circle
        class="dct-continuous__handle"
        cx={hiT * barWidth}
        cy="6"
        r="6"
        onpointerdown={startDrag('hi')}
        ondblclick={resetHandle('hi')}
        role="slider"
        aria-label="Margen superior"
        aria-valuemin={lo}
        aria-valuemax={section.max}
        aria-valuenow={hi}
        tabindex="0"
      />
    {/if}
  </svg>

  <div class="dct-continuous__labels" style:width="{barWidth}px">
    {#if section.interactive}
      <span class="dct-continuous__tick dct-continuous__tick--handle-lo" style:left="{loT * barWidth}px">{fmt(lo)}</span>
      <span class="dct-continuous__tick dct-continuous__tick--handle-hi" style:left="{hiT * barWidth}px">{fmt(hi)}</span>
    {:else}
      <span class="dct-continuous__edge dct-continuous__edge--start">{fmt(section.min)}</span>
      {#each tickPositions as tick (tick.v)}
        <span class="dct-continuous__tick" style:left="{tick.t * barWidth}px">{tick.label}</span>
      {/each}
      <span class="dct-continuous__edge dct-continuous__edge--end">{fmt(section.max)}</span>
    {/if}
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
  /*
   * Anchored outward (not centered, unlike a plain tick) so the label always
   * grows into the bar instead of over its own edge — a centered label at
   * lo=min or hi=max would overflow past `.dct-chart`'s `overflow: hidden`
   * and get clipped, exactly like the old fixed min/max edge labels never did.
   */
  .dct-continuous__tick--handle-lo,
  .dct-continuous__tick--handle-hi {
    font-weight: 600;
  }
  .dct-continuous__tick--handle-lo {
    transform: none;
  }
  .dct-continuous__tick--handle-hi {
    transform: translateX(-100%);
  }
  .dct-continuous__handle {
    fill: currentColor;
    stroke: var(--dct-bg, #fff);
    stroke-width: 1.5;
    cursor: ew-resize;
    touch-action: none;
  }
  .dct-continuous__handle:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
</style>
