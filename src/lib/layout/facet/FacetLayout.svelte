<script lang="ts" generics="TRow extends Record<string, unknown>">
  import { isMobile } from '$lib/stores/device';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import FacetIndicator from '$lib/layout/facet/FacetIndicator.svelte';
  import Grid from '$lib/layout/grid/Grid.svelte';
  import GridCell from '$lib/layout/grid/GridCell.svelte';
  import { buildFacetPanels } from '$lib/layout/facet/config';
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

  /**
   * Small multiples on a `Grid`: splits `data` and gives each group to
   * the `cell` snippet with its own box. Either one facet per `by` value,
   * titled and wrapped into `columns` - all at once (`mode: 'grid'`), a page
   * at a time (`'paginated'`) or as a swipeable `'carousel'` - or one facet
   * per `rows` × `cols` combination, labelled on strips above and beside.
   * With `align` (the default), every facet's plot area lines up with its
   * row and column.
   */
  let {
    data,
    by,
    rows,
    cols,
    rowValues,
    colValues,
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
    align = true,
  }: {
    data: TRow[];
    /** One facet per value, wrapped into `columns`. */
    by?: Accessor<TRow, unknown>;
    /** One facet row per value - with `cols`, a matrix. */
    rows?: Accessor<TRow, unknown>;
    /** One facet column per value - with `rows`, a matrix. */
    cols?: Accessor<TRow, unknown>;
    rowValues?: string[];
    colValues?: string[];
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
    align?: boolean;
  } = $props();

  /** One facet: its label, rows, and - in a matrix - its row/col values and slot. */
  type Entry = { key: string; label: string; data: TRow[]; row?: string; col?: string; r?: number; c?: number };

  const TITLE_H = 24;
  const NAV_BELOW_H = 44;

  function resolveResponsive<T>(value: Responsive<T>, mobile: boolean): T {
    if (typeof value === 'object' && value !== null && 'desktop' in value) {
      return mobile ? (value as { desktop: T; mobile: T }).mobile : (value as { desktop: T; mobile: T }).desktop;
    }
    return value as T;
  }

  const wrap = $derived(by !== undefined);

  // ── wrapped (`by`) ───────────────────────────────────────────────────────
  // The panels, in the order a plot's "facet" phase lays them out.
  const panels = $derived(
    buildFacetPanels(by !== undefined ? { by, values } : { rows, cols, rowValues, colValues }, data),
  );

  const wrapEntries = $derived.by((): Entry[] => {
    if (by === undefined) return [];
    return panels.map((panel) => ({ key: panel.key, label: panel.label, data: panel.rows }));
  });

  // ── matrix (`rows` × `cols`) ─────────────────────────────────────────────
  const getRow = $derived(rows === undefined ? null : resolveAccessor<TRow>(rows));
  const getCol = $derived(cols === undefined ? null : resolveAccessor<TRow>(cols));

  function distinct(get: ((d: TRow) => unknown) | null, given: string[] | undefined): string[] {
    if (!get) return [''];
    if (given) return given;
    return [...new Set(data.map((d) => String(get(d))))];
  }

  const rowKeys = $derived(distinct(getRow, rowValues));
  const colKeys = $derived(distinct(getCol, colValues));

  const matrixEntries = $derived.by((): Entry[] => {
    if (wrap) return [];
    return panels.map((panel) => {
      const r = rowKeys.indexOf(panel.row ?? '');
      const c = colKeys.indexOf(panel.col ?? '');
      return { key: `${r}:${c}`, label: panel.label, data: panel.rows, row: panel.row, col: panel.col, r, c };
    });
  });

  // ── wrapped modes ────────────────────────────────────────────────────────
  const resolvedMode = $derived(wrap ? resolveResponsive(mode, $isMobile) : 'grid');

  const gridCols = $derived(
    Math.max(1, Math.min(resolveResponsive(columns, $isMobile), wrapEntries.length || 1)),
  );
  const gridRows = $derived(Math.ceil((wrapEntries.length || 1) / gridCols));

  const resolvedPageSize = $derived(Math.max(1, pageSize ?? gridCols * gridRows));
  let page = $state(0);
  const totalPages = $derived(Math.max(1, Math.ceil(wrapEntries.length / resolvedPageSize)));
  const pageEntries = $derived(
    resolvedMode === 'paginated'
      ? wrapEntries.slice(page * resolvedPageSize, page * resolvedPageSize + resolvedPageSize)
      : wrapEntries,
  );

  $effect(() => {
    if (page > totalPages - 1) page = Math.max(0, totalPages - 1);
  });

  const showNav = $derived(resolvedMode === 'paginated' && totalPages > 1);
  // A page sizes its grid off what it shows, not the full entry count.
  const pageCols = $derived(Math.max(1, Math.min(gridCols, pageEntries.length || 1)));
  const gridHeight = $derived(
    navLayout === 'below' && showNav ? Math.max(0, height - NAV_BELOW_H) : height,
  );

  // ── carousel ─────────────────────────────────────────────────────────────
  // A carousel cell slides past every other, so each one draws all its axes.
  const CAROUSEL_EDGES = { top: true, right: true, bottom: true, left: true };
  const visibleCount = $derived(Math.max(1, Math.min(visible, wrapEntries.length || 1)));
  const carouselCellWidth = $derived(
    Math.max(0, Math.floor((width - (visibleCount - 1) * gap) / visibleCount)),
  );
  const carouselCellHeight = $derived(Math.max(0, height - TITLE_H));
  const maxIndex = $derived(Math.max(0, wrapEntries.length - visibleCount));
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
      <button type="button" class="dct-facet-paginated__btn" {disabled} {onclick} aria-label={label}>
        {glyph}
      </button>
    {/if}
  </span>
{/snippet}

{#snippet facetCells(entries: Entry[], columnCount: number)}
  {#each entries as entry, i (entry.key)}
    <GridCell
      row={entry.r ?? Math.floor(i / columnCount)}
      col={entry.c ?? i % columnCount}
      label={wrap ? entry.label : undefined}
      data-row={entry.row}
      data-col={entry.col}
    >
      {#snippet children(box)}
        {@render cell({
          facetValue: entry.label,
          row: entry.row,
          col: entry.col,
          data: entry.data,
          width: box.width,
          height: box.height,
          margins: box.margins,
          edges: box.edges,
        })}
      {/snippet}
    </GridCell>
  {/each}
{/snippet}

{#if !wrap}
  <Grid
    {width}
    {height}
    {gap}
    {align}
    columns={colKeys.length}
    rows={rowKeys.length}
    colLabels={getCol ? colKeys : undefined}
    rowLabels={getRow ? rowKeys : undefined}
  >
    {@render facetCells(matrixEntries, colKeys.length)}
  </Grid>
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
      {#each wrapEntries as entry (entry.key)}
        <div class="dct-facet-carousel__cell" style:width="{carouselCellWidth}px">
          <div class="dct-facet-carousel__title" style:height="{TITLE_H}px">{entry.label}</div>
          {#if carouselCellWidth > 0 && carouselCellHeight > 0}
            {@render cell({
              facetValue: entry.label,
              data: entry.data,
              width: carouselCellWidth,
              height: carouselCellHeight,
              edges: CAROUSEL_EDGES,
            })}
          {/if}
        </div>
      {/each}
    </div>
    {#if wrapEntries.length > 1}
      {@render indicatorSlot(activeIndex + 1, wrapEntries.length)}
    {/if}
  </div>
{:else}
  <div class="dct-facet-paginated" style:width="{width}px" style:height="{height}px">
    {#key page}
      <Grid {width} height={gridHeight} {gap} {align} header={TITLE_H} columns={pageCols}>
        {@render facetCells(pageEntries, pageCols)}
      </Grid>
    {/key}
    {#if showNav}
      {#if navLayout === 'below'}
        <div class="dct-facet-paginated__nav-below" style:height="{NAV_BELOW_H}px">
          {@render navButtons('prev', page === 0, () => (page = Math.max(0, page - 1)), 'Previous page', '‹')}
          {@render indicatorContent(page + 1, totalPages)}
          {@render navButtons('next', page >= totalPages - 1, () => (page = Math.min(totalPages - 1, page + 1)), 'Next page', '›')}
        </div>
      {:else}
        <div class="dct-facet-paginated__nav">
          {@render navButtons('prev', page === 0, () => (page = Math.max(0, page - 1)), 'Previous page', '‹')}
          {@render navButtons('next', page >= totalPages - 1, () => (page = Math.min(totalPages - 1, page + 1)), 'Next page', '›')}
        </div>
        {@render indicatorSlot(page + 1, totalPages)}
      {/if}
    {/if}
  </div>
{/if}

<style>
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
    display: flex;
    flex-direction: column;
  }
  .dct-facet-carousel__title {
    flex: 0 0 auto;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
    opacity: 0.9;
  }
</style>
