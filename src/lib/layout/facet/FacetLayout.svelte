<script lang="ts" generics="TRow extends Record<string, unknown>">
  import { isMobile } from '$lib/stores/device';
  import { groupBy } from '$lib/utils/grouping';
  import FacetIndicator from '$lib/layout/facet/FacetIndicator.svelte';
  import type {
    FacetColumns,
    FacetMode,
    Responsive,
    FacetCellSnippet,
    FacetIndicatorSnippet,
    FacetNavSnippet,
    FacetNavDirection,
  } from '$lib/types/charts/common';
  import type { Accessor } from '$lib/types/plots/data/common';

  /**
   * Small-multiples layout. It splits the data by `by` and hands each group to
   * the `cell` snippet with its own measured box. Like the other primitives it
   * never draws the plot itself — any plot that accepts `{ data, width, height }`
   * can be faceted.
   *
   * `mode` picks how the groups are arranged: `'grid'` (default) lays them all
   * out at once; `'paginated'` pages through the same grid in fixed chunks;
   * `'carousel'` shows `visible` groups at a time with touch-drag/snap.
   */
  let {
    data,
    by,
    columns = { desktop: 3, mobile: 1 },
    values,
    gap = 12,
    mode = 'grid',
    visible = 1,
    pageSize,
    formatIndicator,
    indicator,
    navButton,
    width,
    height,
    cell,
  }: {
    data: TRow[];
    by: Accessor<TRow, unknown>;
    columns?: FacetColumns;
    values?: string[];
    gap?: number;
    mode?: Responsive<FacetMode>;
    visible?: number;
    pageSize?: number;
    formatIndicator?: (current: number, total: number) => string;
    indicator?: FacetIndicatorSnippet;
    navButton?: FacetNavSnippet;
    width: number;
    height: number;
    cell: FacetCellSnippet<TRow>;
  } = $props();

  function resolveResponsive<T>(value: Responsive<T>, mobile: boolean): T {
    if (typeof value === 'object' && value !== null && 'desktop' in value) {
      return mobile ? (value as { desktop: T; mobile: T }).mobile : (value as { desktop: T; mobile: T }).desktop;
    }
    return value as T;
  }

  const groups = $derived(groupBy(data, by));

  const entries = $derived.by((): [string, TRow[]][] => {
    if (!values) return [...groups.entries()];
    return values
      .filter((v) => groups.has(v))
      .map((v) => [v, groups.get(v)!] as [string, TRow[]]);
  });

  const resolvedMode = $derived(resolveResponsive(mode, $isMobile));

  const cols = $derived.by(() => {
    const desired = resolveResponsive(columns, $isMobile);
    return Math.max(1, Math.min(desired, entries.length || 1));
  });

  const rows = $derived(Math.ceil((entries.length || 1) / cols));
  const cellWidth = $derived(Math.max(0, Math.floor((width - (cols - 1) * gap) / cols)));
  const TITLE_H = 24;
  const cellHeight = $derived(
    Math.max(0, Math.floor((height - (rows - 1) * gap) / rows) - TITLE_H),
  );

  // ── paginated ────────────────────────────────────────────────────────────
  const resolvedPageSize = $derived(Math.max(1, pageSize ?? cols * rows));
  let page = $state(0);
  const totalPages = $derived(Math.max(1, Math.ceil(entries.length / resolvedPageSize)));
  const pageEntries = $derived(
    entries.slice(page * resolvedPageSize, page * resolvedPageSize + resolvedPageSize),
  );

  $effect(() => {
    if (page > totalPages - 1) page = Math.max(0, totalPages - 1);
  });

  function prevPage(): void {
    page = Math.max(0, page - 1);
  }
  function nextPage(): void {
    page = Math.min(totalPages - 1, page + 1);
  }

  // ── carousel ─────────────────────────────────────────────────────────────
  const visibleCount = $derived(Math.max(1, Math.min(visible, entries.length || 1)));
  const carouselCellWidth = $derived(
    Math.max(0, Math.floor((width - (visibleCount - 1) * gap) / visibleCount)),
  );
  const carouselCellHeight = $derived(Math.max(0, height - TITLE_H));
  const maxIndex = $derived(Math.max(0, entries.length - visibleCount));
  const stepWidth = $derived(carouselCellWidth + gap);

  let activeIndex = $state(0);
  let dragOffset = $state(0);
  let dragging = $state(false);
  let dragStartX = 0;

  const translate = $derived(-activeIndex * stepWidth + dragOffset);

  $effect(() => {
    if (activeIndex > maxIndex) activeIndex = maxIndex;
  });

  // Reset browsing position whenever the faceted field or its value set changes.
  $effect(() => {
    void by;
    void values;
    page = 0;
    activeIndex = 0;
  });

  function handleTouchStart(event: TouchEvent): void {
    dragging = true;
    dragStartX = event.touches[0].clientX;
    dragOffset = 0;
  }

  function handleTouchMove(event: TouchEvent): void {
    if (!dragging) return;
    dragOffset = event.touches[0].clientX - dragStartX;
  }

  function handleTouchEnd(): void {
    if (!dragging) return;
    dragging = false;
    const stepsMoved = Math.round(-dragOffset / stepWidth);
    activeIndex = Math.max(0, Math.min(maxIndex, activeIndex + stepsMoved));
    dragOffset = 0;
  }
</script>

{#snippet indicatorSlot(current: number, total: number)}
  <div class="dct-facet-indicator-slot">
    {#if indicator}
      {@render indicator({ current, total })}
    {:else}
      <FacetIndicator {current} {total} format={formatIndicator} />
    {/if}
  </div>
{/snippet}

{#snippet navButtons(direction: FacetNavDirection, disabled: boolean, onclick: () => void, label: string, glyph: string)}
  <span class="dct-facet-nav-slot">
    {#if navButton}
      {@render navButton({ direction, disabled, onclick })}
    {:else}
      <button
        type="button"
        class="dct-facet-paginated__btn"
        {disabled}
        {onclick}
        aria-label={label}
      >
        {glyph}
      </button>
    {/if}
  </span>
{/snippet}

{#snippet grid(gridEntries: [string, TRow[]][])}
  <div class="dct-facet" style:grid-template-columns="repeat({cols}, 1fr)" style:gap="{gap}px">
    {#each gridEntries as [facetValue, rowsForCell] (facetValue)}
      <div class="dct-facet__cell">
        <div class="dct-facet__title">{facetValue}</div>
        {#if cellWidth > 0 && cellHeight > 0}
          {@render cell({ facetValue, data: rowsForCell, width: cellWidth, height: cellHeight })}
        {/if}
      </div>
    {/each}
  </div>
{/snippet}

{#if resolvedMode === 'paginated'}
  <div class="dct-facet-paginated" style:width="{width}px" style:height="{height}px">
    {@render grid(pageEntries)}
    {#if totalPages > 1}
      <div class="dct-facet-paginated__nav">
        {@render navButtons('prev', page === 0, prevPage, 'Previous page', '‹')}
        {@render navButtons('next', page >= totalPages - 1, nextPage, 'Next page', '›')}
      </div>
      {@render indicatorSlot(page + 1, totalPages)}
    {/if}
  </div>
{:else if resolvedMode === 'carousel'}
  <div
    class="dct-facet-carousel"
    role="group"
    aria-roledescription="carousel"
    style:width="{width}px"
    style:height="{height}px"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
  >
    <div
      class="dct-facet-carousel__track"
      class:dct-facet-carousel__track--dragging={dragging}
      style:gap="{gap}px"
      style:transform="translateX({translate}px)"
    >
      {#each entries as [facetValue, rowsForCell] (facetValue)}
        <div class="dct-facet__cell dct-facet-carousel__cell" style:width="{carouselCellWidth}px">
          <div class="dct-facet__title">{facetValue}</div>
          {#if carouselCellWidth > 0 && carouselCellHeight > 0}
            {@render cell({
              facetValue,
              data: rowsForCell,
              width: carouselCellWidth,
              height: carouselCellHeight,
            })}
          {/if}
        </div>
      {/each}
    </div>
    {#if entries.length > 1}
      {@render indicatorSlot(activeIndex + 1, entries.length)}
    {/if}
  </div>
{:else}
  {@render grid(entries)}
{/if}

<style>
  .dct-facet {
    display: grid;
    width: 100%;
    height: 100%;
  }
  .dct-facet__cell {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }
  .dct-facet__title {
    flex: 0 0 auto;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
    opacity: 0.9;
  }

  .dct-facet-paginated {
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .dct-facet-paginated__nav {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .dct-facet-nav-slot {
    pointer-events: auto;
  }
  .dct-facet-paginated__btn {
    border: none;
    border-radius: 999px;
    width: var(--dct-facet-nav-btn-size, 2rem);
    height: var(--dct-facet-nav-btn-size, 2rem);
    font-size: var(--dct-facet-nav-font-size, 1.1rem);
    line-height: 1;
    background: var(--dct-facet-nav-bg, #111827);
    color: var(--dct-facet-nav-color, #fff);
    cursor: pointer;
  }
  .dct-facet-paginated__btn:disabled {
    opacity: var(--dct-facet-nav-disabled-opacity, 0.3);
    cursor: default;
  }

  .dct-facet-indicator-slot {
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
  }

  .dct-facet-carousel {
    position: relative;
    overflow: hidden;
    touch-action: pan-y;
  }
  .dct-facet-carousel__track {
    display: flex;
    height: 100%;
    transition: transform 0.25s ease;
  }
  .dct-facet-carousel__track--dragging {
    transition: none;
  }
  .dct-facet-carousel__cell {
    flex: 0 0 auto;
  }
</style>
