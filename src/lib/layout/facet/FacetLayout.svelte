<script lang="ts" generics="TRow extends Record<string, unknown>">
  import { isMobile } from '$lib/stores/device';
  import { groupBy } from '$lib/utils/grouping';
  import FacetIndicator from '$lib/layout/facet/FacetIndicator.svelte';
  import FacetCellFrame from '$lib/layout/facet/FacetCellFrame.svelte';
  import { buildAlignedCells } from '$lib/layout/facet/alignment';
  import { createMarginReports } from '$lib/layout/facet/marginReports.svelte';
  import { buildSharedMargins, wrapEdges } from '$lib/layout/facet/margins';
  import type {
    FacetColumns,
    FacetMode,
    FacetNavLayout,
    Responsive,
    FacetCellSnippet,
    FacetIndicatorSnippet,
    FacetNavSnippet,
    FacetNavDirection,
  } from '$lib/types/layout/facet';
  import type { Accessor } from '$lib/types/plots/data/common';
  import type { MarginConfig } from '$lib/types/plots/props';

  /**
   * Small multiples: splits `data` by `by` and gives each group to the `cell`
   * snippet with its own box. `mode` is `'grid'` (default), `'paginated'` or
   * `'carousel'`; `marginsForFacet` sizes one margin shared by every facet.
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
    navLayout = 'overlay',
    formatIndicator,
    indicator,
    navButton,
    width,
    height,
    cell,
    marginsForFacet,
    align = false,
  }: {
    data: TRow[];
    by: Accessor<TRow, unknown>;
    columns?: FacetColumns;
    values?: string[];
    gap?: number;
    mode?: Responsive<FacetMode>;
    visible?: number;
    pageSize?: number;
    navLayout?: FacetNavLayout;
    formatIndicator?: (current: number, total: number) => string;
    indicator?: FacetIndicatorSnippet;
    navButton?: FacetNavSnippet;
    width: number;
    height: number;
    cell: FacetCellSnippet<TRow>;
    marginsForFacet?: (rows: TRow[]) => MarginConfig;
    /** Sizes rows and columns so every panel gets the same box, whatever axes each facet draws (grid and paginated modes) - see `buildAlignedCells`. */
    align?: boolean;
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

  // One shared margin across every facet - see `marginsForFacet`.
  const cellMargins = $derived(
    marginsForFacet ? buildSharedMargins(entries.map(([, rows]) => rows), marginsForFacet) : undefined,
  );

  const resolvedMode = $derived(resolveResponsive(mode, $isMobile));

  // Columns/rows for a "full" grid of every entry - used for plain grid-mode
  // layout, and as the default `pageSize` (one page = one full screen).
  const gridCols = $derived.by(() => {
    const desired = resolveResponsive(columns, $isMobile);
    return Math.max(1, Math.min(desired, entries.length || 1));
  });
  const gridRows = $derived(Math.ceil((entries.length || 1) / gridCols));

  // ── paginated ────────────────────────────────────────────────────────────
  const resolvedPageSize = $derived(Math.max(1, pageSize ?? gridCols * gridRows));
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

  const showNav = $derived(resolvedMode === 'paginated' && totalPages > 1);
  const NAV_BELOW_H = 44;

  // Columns and rows sized to what's on screen: the current page when paginated.
  const cols = $derived(
    resolvedMode === 'paginated' ? Math.max(1, Math.min(gridCols, pageEntries.length || 1)) : gridCols,
  );
  const rows = $derived(
    resolvedMode === 'paginated' ? Math.ceil((pageEntries.length || 1) / cols) : gridRows,
  );
  // Height left for the cells once a `'below'` nav row is reserved.
  const contentHeight = $derived(
    resolvedMode === 'paginated' && navLayout === 'below' && showNav
      ? Math.max(0, height - NAV_BELOW_H)
      : height,
  );
  const cellWidth = $derived(Math.max(0, Math.floor((width - (cols - 1) * gap) / cols)));
  const TITLE_H = 24;
  const cellHeight = $derived(
    Math.max(0, Math.floor((contentHeight - (rows - 1) * gap) / rows) - TITLE_H),
  );

  // ── aligned panels ───────────────────────────────────────────────────────
  const reports = createMarginReports();
  function alignedFor(gridEntries: [string, TRow[]][]) {
    if (!align) return undefined;
    return buildAlignedCells({
      columns: cols,
      rows,
      width,
      height: contentHeight,
      gap,
      rowReserve: TITLE_H,
      margins: Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const entry = gridEntries[r * cols + c];
          return entry ? reports.settled[entry[0]] : null;
        }),
      ),
    });
  }

  // ── carousel ─────────────────────────────────────────────────────────────
  // A carousel cell slides past every other, so each one draws all its axes.
  const CAROUSEL_EDGES = { top: true, right: true, bottom: true, left: true };
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

{#snippet indicatorContent(current: number, total: number)}
  {#if indicator}
    {@render indicator({ current, total })}
  {:else}
    <FacetIndicator {current} {total} format={formatIndicator} />
  {/if}
{/snippet}

{#snippet indicatorSlot(current: number, total: number)}
  <div class="dct-facet-indicator-slot">
    {@render indicatorContent(current, total)}
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
  {@const aligned = alignedFor(gridEntries)}
  <div
    class="dct-facet"
    style:grid-template-columns={aligned ? aligned.colWidths.map((w) => `${w}px`).join(' ') : `repeat(${cols}, 1fr)`}
    style:grid-template-rows={aligned ? aligned.rowHeights.map((h) => `${h}px`).join(' ') : undefined}
    style:gap="{gap}px"
  >
    {#each gridEntries as [facetValue, rowsForCell], i (facetValue)}
      {@const box = aligned?.cells[Math.floor(i / cols)]?.[i % cols]}
      {@const place = {
        facetValue,
        data: rowsForCell,
        width: box?.width ?? cellWidth,
        height: box?.height ?? cellHeight,
        margins: box ? { ...cellMargins, ...box.margins } : cellMargins,
        edges: wrapEdges(i, gridEntries.length, cols),
      }}
      <div class="dct-facet__cell">
        <div class="dct-facet__title">{facetValue}</div>
        {#if cellWidth > 0 && cellHeight > 0}
          {#if align}
            <FacetCellFrame
              pinned={box?.margins}
              onMargins={(m) => reports.report(facetValue, m)}
            >
              {@render cell(place)}
            </FacetCellFrame>
          {:else}
            {@render cell(place)}
          {/if}
        {/if}
      </div>
    {/each}
  </div>
{/snippet}

{#if resolvedMode === 'paginated'}
  <div class="dct-facet-paginated" style:width="{width}px" style:height="{height}px">
    {@render grid(pageEntries)}
    {#if showNav}
      {#if navLayout === 'below'}
        <div class="dct-facet-paginated__nav-below" style:height="{NAV_BELOW_H}px">
          {@render navButtons('prev', page === 0, prevPage, 'Previous page', '‹')}
          {@render indicatorContent(page + 1, totalPages)}
          {@render navButtons('next', page >= totalPages - 1, nextPage, 'Next page', '›')}
        </div>
      {:else}
        <div class="dct-facet-paginated__nav">
          {@render navButtons('prev', page === 0, prevPage, 'Previous page', '‹')}
          {@render navButtons('next', page >= totalPages - 1, nextPage, 'Next page', '›')}
        </div>
        {@render indicatorSlot(page + 1, totalPages)}
      {/if}
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
              margins: cellMargins,
              edges: CAROUSEL_EDGES,
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
    /* Lets the grid shrink beside a fixed-height nav row in a flex parent. */
    flex: 1 1 auto;
    min-height: 0;
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
  .dct-facet-paginated__nav-below {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--dct-facet-nav-below-gap, 0.75rem);
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
