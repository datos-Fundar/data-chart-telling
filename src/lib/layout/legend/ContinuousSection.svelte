<script lang="ts">
  import { untrack } from 'svelte';
  import type { ContinuousLegendSection } from '$lib/types/layout/legend';
  import { makeColorScale } from '$lib/utils/color';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { getLegendInteraction, createLegendInteraction } from '$lib/layout/legend/interaction.svelte';

  let { section }: { section: ContinuousLegendSection } = $props();

  const cfg = $derived(getConfiguration());
  const gradientId = `dct-grad-${Math.random().toString(36).slice(2)}`;
  const barWidth = $derived(section.width ?? 170);

  const fmt = $derived(section.format ?? ((v: number) => String(v)));
  const isInteractive = $derived(section.interactive?.enabled ?? false);

  // Fill/opacity for the excluded-margin rects.
  const excludedStyle = $derived.by((): { fill: string; opacity: number } => {
    const d = section.interactive?.disabledStyle;
    if (d?.fill) return { fill: d.fill, opacity: d.fillOpacity ?? d.opacity ?? 1 };
    return { fill: 'currentColor', opacity: d?.fillOpacity ?? d?.opacity ?? 0.35 };
  });

  const tickPositions = $derived(
    isInteractive
      ? []
      : (section.ticks ?? []).map((v) => ({
          v,
          t: (v - section.min) / (section.max - section.min || 1),
          label: fmt(v),
        })),
  );

  // ── Drag-to-narrow-margins ────────────────────────────────────────────────
  const interaction = getLegendInteraction() ?? createLegendInteraction();

  // Seeded once from the section's own bounds (deliberately untracked — see
  // the tracking/clamping effect below for how later prop changes are
  // handled instead).
  let lo = $state(untrack(() => section.min));
  let hi = $state(untrack(() => section.max));

  // Whether the user has actually dragged *that* handle off its default
  // position — tracked per handle, not as one combined flag, so dragging one
  // doesn't freeze the other: until the other is touched, it must keep
  // tracking `section.min`/`max` exactly, since a consumer's domain routinely
  // changes with no interaction at all (e.g. a different year picked on its
  // own timeline), and with nothing to protect there the legend should
  // always read the true current extent rather than some earlier domain's
  // stale numbers.
  let loAdjusted = $state(false);
  let hiAdjusted = $state(false);

  // Once a handle *has* been dragged, a later domain change (same scenario as
  // above, but now with a selection to protect) instead re-clamps it to stay
  // valid: the lower handle only moves up to meet a risen min, the upper
  // handle only moves down to meet a fallen max. Clamping against *both* of
  // the new min/max first (not just its own side) keeps a handle from
  // crossing the other if the domain shifts entirely past its old position.
  $effect(() => {
    lo = loAdjusted ? Math.min(Math.max(lo, section.min), section.max) : section.min;
    hi = hiAdjusted ? Math.max(Math.min(hi, section.max), section.min) : section.max;
  });

  function toT(v: number): number {
    return (v - section.min) / (section.max - section.min || 1);
  }
  const loT = $derived(toT(lo));
  const hiT = $derived(toT(hi));

  const colorDomain = $derived.by((): [number, number] =>
    isInteractive && (section.interactive?.mode ?? 'filter') === 'rescale'
      ? [lo, hi]
      : [section.min, section.max],
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
    if (!isInteractive) return;
    interaction.continuousRange =
      lo <= section.min && hi >= section.max
        ? null
        : {
            min: lo,
            max: hi,
            mode: section.interactive?.mode ?? 'filter',
            disabledStyle: section.interactive?.disabledStyle ?? { opacity: cfg.legend.disabledOpacity },
          };
  });

  // Mirrors an externally-set `interaction.continuousRange` into lo/hi.
  $effect(() => {
    if (!isInteractive) return;
    const range = interaction.continuousRange;
    if (range === null) {
      if (untrack(() => loAdjusted || hiAdjusted)) {
        loAdjusted = false;
        hiAdjusted = false;
      }
      return;
    }
    const [currentLo, currentHi] = untrack(() => [lo, hi]);
    if (range.min !== currentLo || range.max !== currentHi) {
      lo = range.min;
      hi = range.max;
      loAdjusted = true;
      hiAdjusted = true;
    }
  });

  function startDrag(which: 'lo' | 'hi') {
    return (event: PointerEvent) => {
      if (!isInteractive) return;
      event.preventDefault();
      if (which === 'lo') loAdjusted = true;
      else hiAdjusted = true;
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
      if (which === 'lo') {
        lo = section.min;
        loAdjusted = false;
      } else {
        hi = section.max;
        hiAdjusted = false;
      }
    };
  }

  let loLabelWidth = $state(0);
  let hiLabelWidth = $state(0);

  const labelsOverlap = $derived(
    isInteractive &&
      cfg.legend.continuous.label.overlap.enabled &&
      (hiT - loT) * barWidth - loLabelWidth - hiLabelWidth < cfg.legend.continuous.label.overlap.margin,
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
      <rect class="dct-continuous__tick-mark" x={tick.t * barWidth} y="12" />
    {/each}

    {#if isInteractive}
      {#if loT > 0}
        <rect x="0" y="0" width={loT * barWidth} height="12" rx="2" fill={excludedStyle.fill} fill-opacity={excludedStyle.opacity} />
      {/if}
      {#if hiT < 1}
        <rect x={hiT * barWidth} y="0" width={barWidth - hiT * barWidth} height="12" rx="2" fill={excludedStyle.fill} fill-opacity={excludedStyle.opacity} />
      {/if}
      {#if section.interactive?.handle}
        {@render section.interactive.handle({
          which: 'lo',
          value: lo,
          position: loT,
          onpointerdown: startDrag('lo'),
          ondoubleclick: resetHandle('lo'),
        })}
        {@render section.interactive.handle({
          which: 'hi',
          value: hi,
          position: hiT,
          onpointerdown: startDrag('hi'),
          ondoubleclick: resetHandle('hi'),
        })}
      {:else}
        <rect
          class="dct-continuous__handle"
          x={loT * barWidth}
          y="6"
          onpointerdown={startDrag('lo')}
          ondblclick={resetHandle('lo')}
          role="slider"
          aria-label="Margen inferior"
          aria-valuemin={section.min}
          aria-valuemax={hi}
          aria-valuenow={lo}
          tabindex="0"
        />
        <rect
          class="dct-continuous__handle"
          x={hiT * barWidth}
          y="6"
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
    {/if}
  </svg>

  <div class="dct-continuous__labels" style:width="{barWidth}px">
    {#if isInteractive}
      <span class="dct-continuous__tick-measure" aria-hidden="true" bind:clientWidth={loLabelWidth}>{fmt(lo)}</span>
      <span class="dct-continuous__tick-measure" aria-hidden="true" bind:clientWidth={hiLabelWidth}>{fmt(hi)}</span>
      <span
        class="dct-continuous__tick dct-continuous__tick--handle-lo"
        class:dct-continuous__tick--vertical={labelsOverlap}
        style:left="{loT * barWidth}px"
      >{fmt(lo)}</span>
      <span
        class="dct-continuous__tick dct-continuous__tick--handle-hi"
        class:dct-continuous__tick--vertical={labelsOverlap}
        style:left="{hiT * barWidth}px"
      >{fmt(hi)}</span>
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
    font-size: var(--dct-continuous-label-size, 0.875rem);
    user-select: none;
  }
  .dct-continuous__edge {
    position: absolute;
    transform: rotate(var(--dct-continuous-label-rotate, 0deg));
  }
  .dct-continuous__edge--start {
    left: 0;
  }
  .dct-continuous__edge--end {
    right: 0;
  }
  .dct-continuous__tick {
    position: absolute;
    white-space: nowrap;
    transform: translateX(-50%) rotate(var(--dct-continuous-label-rotate, 0deg));
  }
  /*
   * Anchored outward (not centered, unlike a plain tick) so the label always
   * grows into the bar instead of over its own edge — a centered label at
   * lo=min or hi=max would overflow past `.dct-chart`'s `overflow: hidden`
   * and get clipped, exactly like the old fixed min/max edge labels never did.
   */
  .dct-continuous__tick--handle-lo,
  .dct-continuous__tick--handle-hi {
    font-weight: var(--dct-continuous-label-weight, 600);
  }
  .dct-continuous__tick--handle-lo {
    transform: rotate(var(--dct-continuous-label-rotate, 0deg));
  }
  .dct-continuous__tick--handle-hi {
    transform: translateX(-100%) rotate(var(--dct-continuous-label-rotate, 0deg));
  }
  /* Invisible, always-horizontal twin used only to measure a handle label's
     natural width (see `labelsOverlap` above) — never rendered. */
  .dct-continuous__tick-measure {
    position: absolute;
    visibility: hidden;
    white-space: nowrap;
    font-weight: var(--dct-continuous-label-weight, 600);
  }
  .dct-continuous__tick--handle-lo.dct-continuous__tick--vertical {
    transform-origin: left bottom;
    transform: rotate(var(--dct-continuous-label-overlap-rotate, 90deg));
  }
  .dct-continuous__tick--handle-hi.dct-continuous__tick--vertical {
    transform-origin: right bottom;
    transform: rotate(calc(var(--dct-continuous-label-overlap-rotate, 90deg) * -1));
  }
  /* Tick mark below the bar at each non-interactive tick's position. */
  .dct-continuous__tick-mark {
    width: var(--dct-continuous-tick-width, 1px);
    height: var(--dct-continuous-tick-length, 6px);
    fill: var(--dct-continuous-tick-color, currentColor);
    transform-box: fill-box;
    transform: translateX(-50%);
  }
  /* Draggable lo/hi handle. */
  .dct-continuous__handle {
    width: var(--dct-continuous-handle-width, 6px);
    height: var(--dct-continuous-handle-height, 20px);
    rx: var(--dct-continuous-handle-radius, 3px);
    fill: var(--dct-continuous-handle-fill, currentColor);
    stroke: var(--dct-continuous-handle-stroke, var(--dct-bg, #fff));
    stroke-width: var(--dct-continuous-handle-stroke-width, 1.5px);
    transform-box: fill-box;
    transform-origin: center;
    transform: translate(-50%, -50%);
    cursor: ew-resize;
    touch-action: none;
  }
  .dct-continuous__handle:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
</style>
