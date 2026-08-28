<script lang="ts" generics="TRow extends Record<string, unknown>">
  import { isMobile } from '$lib/stores/device';
  import { groupBy } from '$lib/utils/grouping';
  import FacetIndicator from '$lib/layout/facet/FacetIndicator.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { measureMaxLabelWidth } from '$lib/layout/plot/measureText';
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
   * Small-multiples layout. It splits the data by `by` and hands each group to
   * the `cell` snippet with its own measured box. Like the other primitives it
   * never draws the plot itself — any plot that accepts `{ data, width, height }`
   * can be faceted.
   *
   * `mode` picks how the groups are arranged: `'grid'` (default) lays them all
   * out at once; `'paginated'` pages through the same grid in fixed chunks;
   * `'carousel'` shows `visible` groups at a time with touch-drag/snap.
   *
   * `labelsForMargin`, if given, sizes one shared left margin across every
   * facet — pass it through `cell`'s own `margins` to a faceted plot's
   * `margins` prop so they all share the same content box.
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
    labelsForMargin,
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
    labelsForMargin?: (rows: TRow[]) => string[];
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

  // One shared left margin, sized to the widest label across every facet —
  // measured off-DOM (canvas), so it's correct from the very first render
  // with no mount/remount needed. `undefined` when `labelsForMargin` isn't given.
  const cfg = $derived(getConfiguration());
  const axisFont = $derived(`${cfg.axis.fontSize}px ${cfg.font === 'inherit' ? 'sans-serif' : cfg.font}`);
  const cellMargins = $derived.by((): MarginConfig | undefined => {
    if (!labelsForMargin) return undefined;
    const labels = entries.flatMap(([, rows]) => labelsForMargin(rows));
    const left = Math.ceil(measureMaxLabelWidth(labels, axisFont)) + cfg.axis.yTickSize + cfg.axis.yTickPadding;
    return { left };
  });

  const resolvedMode = $derived(resolveResponsive(mode, $isMobile));

  // Columns/rows for a "full" grid of every entry — used for plain grid-mode
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

  // Columns/rows actually used to size each rendered cell. `grid` mode always
  // renders every entry, so it sizes off `gridCols`/`gridRows` as before. In
  // `paginated` mode only `pageEntries` (at most `pageSize`, possibly fewer
  // on the last page) are ever on screen at once — sizing off the *total*
  // entry count instead (as `gridCols`/`gridRows` do) left a page with fewer
  // entries than a full grid mostly blank, e.g. `pageSize: 1` still reserved
  // room for every other page's rows instead of filling the chart area with
  // its one cell.
  const cols = $derived(
    resolvedMode === 'paginated' ? Math.max(1, Math.min(gridCols, pageEntries.length || 1)) : gridCols,
  );
  const rows = $derived(
    resolvedMode === 'paginated' ? Math.ceil((pageEntries.length || 1) / cols) : gridRows,
  );
  // In `navLayout: 'below'`, the nav row sits in normal flow beneath the
  // grid rather than floating over it, so the cells must be measured against
  // the height left over after reserving space for that row.
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
  <div class="dct-facet" style:grid-template-columns="repeat({cols}, 1fr)" style:gap="{gap}px">
    {#each gridEntries as [facetValue, rowsForCell] (facetValue)}
      <div class="dct-facet__cell">
        <div class="dct-facet__title">{facetValue}</div>
        {#if cellWidth > 0 && cellHeight > 0}
          {@render cell({ facetValue, data: rowsForCell, width: cellWidth, height: cellHeight, margins: cellMargins })}
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
    /* Only takes effect when `.dct-facet` is itself a flex item (inside
       `.dct-facet-paginated`): lets it shrink to the space left over after
       a `flex: 0 0 auto` sibling (the below-layout nav row) claims its
       fixed height, instead of overflowing past the fixed-height parent
       the way a bare `height: 100%` would. No-op outside a flex parent
       (e.g. plain `grid` mode), where `width/height: 100%` alone applies. */
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
