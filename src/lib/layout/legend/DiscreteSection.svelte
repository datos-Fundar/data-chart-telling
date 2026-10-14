<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { paletteColor } from '$lib/utils/color';
	import { LegendState } from '$lib/layout/legend/LegendState.svelte';
	import { DisabledStyle } from '$lib/layout/legend/DisabledStyle';
	import DiscreteBadgeItem from '$lib/layout/legend/DiscreteBadgeItem.svelte';
	import DiscreteSwatchItem from '$lib/layout/legend/DiscreteSwatchItem.svelte';
	import type {
		DiscreteLegendSection,
		LegendDisabledAction,
		LegendItem,
		LegendItemsLayout,
		LegendNavDirection
	} from '$lib/types/layout/legend';

	/** `defaultItemsLayout` is the fallback used when `section.layout` isn't set. */
	let {
		section,
		defaultItemsLayout = { type: 'vertical' }
	}: { section: DiscreteLegendSection; defaultItemsLayout?: LegendItemsLayout } = $props();

	const cfg = $derived(getConfiguration());
	const layout = $derived(section.layout ?? defaultItemsLayout);
	const isHorizontal = $derived(layout.type === 'horizontal');
	const isFlex = $derived(layout.type === 'flex');
	const maxRows = $derived(layout.type === 'horizontal' ? Math.max(1, layout.maxRows ?? 1) : 1);
	/**
	 * Without its own `columns` or `layout`, a vertical section spreads its
	 * items across columns, favoring rows: up to two items side by side, then
	 * half as many columns as items, at most four.
	 */
	const columns = $derived(
		section.columns ??
			(section.layout
				? 1
				: section.items.length <= 2
					? Math.max(1, section.items.length)
					: Math.min(4, Math.ceil(section.items.length / 2)))
	);
	const isInteractive = $derived(section.interactive?.enabled ?? false);
	const useBadge = $derived(
		isInteractive && (section.interactive?.legendStyle ?? 'badge') === 'badge'
	);
	const showIcon = $derived(section.interactive?.showIcon ?? true);
	const disabledAction = $derived<LegendDisabledAction>(
		section.interactive?.disabled ?? { mode: 'dim' }
	);
	const interaction = LegendState.ensure();

	const seeded = new SvelteSet<string>();
	$effect(() => {
		for (const item of section.items) {
			if (seeded.has(item.name)) continue;
			seeded.add(item.name);
			if (item.disabled) {
				interaction.turnOff(item.name, disabledAction);
			}
		}
	});

	function toggle(item: LegendItem): void {
		if (!isInteractive) return;
		if (interaction.isOff(item.name)) {
			interaction.turnOn(item.name);
		} else {
			interaction.turnOff(item.name, disabledAction);
		}
	}

	function onKeydown(event: KeyboardEvent, item: LegendItem): void {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		toggle(item);
	}

	// ── Horizontal pagination ──────────────────────────────────────────────
	// Row breaks are found by measuring each item's `offsetTop` on a full,
	// hidden copy of the list kept in normal document flow - not
	// `position: absolute` - alongside the visible, paginated one.
	// (In-flow is required: an absolutely-positioned measurer doesn't count
	// toward its shrink-to-fit ancestors' width, so the container would
	// collapse to the narrow visible page and each remeasurement would then
	// wrap even fewer items than the last - a runaway shrink.)
	let measurerEl: HTMLDivElement | undefined = $state();
	// Resize trigger for the measurement effect; the value itself is unused.
	let containerWidth = $state(0);
	let rows = $state<number[][]>([]);
	// The item identity `rows` was last measured against, compared with
	// `currentKey` to gate whether `rows` is still trustworthy.
	let measuredKey = $state('');

	// Snapshot of `section.items`' identity and order, compared against
	// `measuredKey` to detect the one-frame gap between `section.items`
	// changing and the measurement effect re-running against the updated
	// DOM. Until they match, `visibleItems` shows every item unpaged rather
	// than indexing stale `rows` into the new list.
	const currentKey = $derived(section.items.map((item) => item.name).join(' '));

	$effect(() => {
		if (!isHorizontal || !measurerEl) {
			rows = [];
			measuredKey = '';
			return;
		}
		void section.items;
		void containerWidth;
		const key = currentKey;
		const children = Array.from(measurerEl.children) as HTMLElement[];
		const grouped: number[][] = [];
		let lastTop = Number.NaN;
		for (let i = 0; i < children.length; i++) {
			const top = children[i].offsetTop;
			if (top !== lastTop) {
				grouped.push([i]);
				lastTop = top;
			} else {
				grouped[grouped.length - 1].push(i);
			}
		}
		rows = grouped;
		measuredKey = key;
	});

	// Whether `rows` was measured against the current item list - before it
	// is, this reads as unpaginated, same as an empty `rows`.
	const rowsCurrent = $derived(measuredKey === currentKey);

	const totalPages = $derived(
		isHorizontal && rowsCurrent ? Math.max(1, Math.ceil(rows.length / maxRows)) : 1
	);
	let page = $state(0);
	$effect(() => {
		if (page > totalPages - 1) page = Math.max(0, totalPages - 1);
	});

	const showNav = $derived(isHorizontal && rowsCurrent && totalPages > 1);

	const visibleItems = $derived.by((): { item: LegendItem; i: number }[] => {
		const all = section.items.map((item, i) => ({ item, i }));
		if (!isHorizontal || !rowsCurrent || rows.length === 0) return all;
		const start = page * maxRows;
		const end = Math.min(rows.length, start + maxRows);
		// `rows` entries are index-ascending, so flattening a page's row slice
		// keeps item order; `rowsCurrent` guarantees `rows` matches
		// `section.items`, so indexing `all` directly is safe.
		return rows
			.slice(start, end)
			.flat()
			.map((i) => all[i]);
	});

	function prevPage(): void {
		page = Math.max(0, page - 1);
	}
	function nextPage(): void {
		page = Math.min(totalPages - 1, page + 1);
	}
</script>

{#snippet discreteItem(item: LegendItem, i: number)}
	{@const action = interaction.actionOf(item.name)}
	{@const isDisabled = action != null}
	{@const omitMode = (action ?? disabledAction).mode === 'omit'}
	{@const disabledStyle = DisabledStyle.ofItem(action, cfg.legend.disabledOpacity)}
	{@const color =
		disabledStyle?.fill ??
		disabledStyle?.stroke?.stroke ??
		item.color ??
		paletteColor(i, cfg.palette)}
	{@const itemOpacity = disabledStyle
		? (disabledStyle.opacity ?? cfg.legend.disabledOpacity)
		: (item.opacity ?? 1)}
	<div
		class="dct-discrete__item"
		class:dct-discrete__item--interactive={isInteractive}
		style:opacity={itemOpacity}
		{...isInteractive
			? {
					role: 'button',
					tabindex: 0,
					'aria-pressed': isDisabled,
					onclick: () => toggle(item),
					onkeydown: (e: KeyboardEvent) => onKeydown(e, item)
				}
			: {}}
	>
		{#if useBadge}
			<DiscreteBadgeItem {item} {color} disabled={isDisabled} {showIcon} {omitMode} />
		{:else}
			<DiscreteSwatchItem {item} {color} />
		{/if}
	</div>
{/snippet}

{#snippet navButtonSlot(
	direction: LegendNavDirection,
	disabled: boolean,
	onclick: () => void,
	label: string
)}
	{#if section.navButton}
		{@render section.navButton({ direction, disabled, onclick })}
	{:else}
		<button
			type="button"
			class="dct-discrete-paginated__btn"
			{disabled}
			{onclick}
			aria-label={label}
		>
			{direction === 'prev' ? '‹' : '›'}
		</button>
	{/if}
{/snippet}

{#if isHorizontal}
	<div class="dct-discrete-paginated">
		{#if showNav}
			{@render navButtonSlot('prev', page === 0, prevPage, 'Previous legend page')}
		{/if}
		<div class="dct-discrete-horizontal" bind:clientWidth={containerWidth}>
			<div class="dct-discrete dct-discrete--horizontal">
				{#each visibleItems as { item, i } (item.name)}
					{@render discreteItem(item, i)}
				{/each}
			</div>
			<div
				class="dct-discrete dct-discrete--horizontal dct-discrete--measure"
				bind:this={measurerEl}
				aria-hidden="true"
			>
				{#each section.items as item, i (item.name)}
					{@render discreteItem(item, i)}
				{/each}
			</div>
		</div>
		{#if showNav}
			{@render navButtonSlot('next', page >= totalPages - 1, nextPage, 'Next legend page')}
		{/if}
	</div>
{:else if isFlex}
	<div class="dct-discrete dct-discrete--horizontal">
		{#each section.items as item, i (item.name)}
			{@render discreteItem(item, i)}
		{/each}
	</div>
{:else}
	<div class="dct-discrete" style:grid-template-columns="repeat({columns}, max-content)">
		{#each section.items as item, i (item.name)}
			{@render discreteItem(item, i)}
		{/each}
	</div>
{/if}

<style>
	.dct-discrete {
		display: grid;
		column-gap: 1.25rem;
		row-gap: 0.4rem;
		max-width: 100%;
	}
	.dct-discrete--horizontal {
		display: flex;
		flex-wrap: wrap;
	}
	/* Items keep their natural width and wrap to a new row instead of
     shrinking - matches the grid variant's `max-content` columns, and
     overrides flex's default `flex-shrink: 1`, which would otherwise cram
     every item onto one line before wrapping. */
	.dct-discrete--horizontal .dct-discrete__item {
		flex-shrink: 0;
	}
	/* Flanks the rows with the prev/next buttons instead of stacking them
	   below; `align-items: center` centers each button against the full
	   block of rows, not just its first/last row. */
	.dct-discrete-paginated {
		display: flex;
		align-items: center;
		gap: var(--dct-legend-nav-gap, 0.35rem);
	}
	.dct-discrete-horizontal {
		flex: 1 1 auto;
		min-width: 0;
	}
	/* Full, untruncated copy of the list, used only to measure row breaks
     (kept in normal flow - see the pagination comment above). Collapsed to
     zero height and clipped so it adds no visible space; `overflow: hidden`
     only clips painted content, so `offsetTop` on its children still
     reports real layout position. */
	.dct-discrete--measure {
		height: 0;
		overflow: hidden;
		visibility: hidden;
		pointer-events: none;
	}
	.dct-discrete__item {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;
		transition: opacity 0.15s ease;
	}
	.dct-discrete__item--interactive {
		cursor: pointer;
	}
	.dct-discrete__item--interactive:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}

	.dct-discrete-paginated__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border: none;
		border-radius: var(--dct-legend-nav-radius, 999px);
		width: var(--dct-legend-nav-size, 1.5rem);
		height: var(--dct-legend-nav-size, 1.5rem);
		padding: 0;
		font-size: var(--dct-legend-nav-font-size, 1rem);
		line-height: 1;
		background: var(--dct-legend-nav-bg, transparent);
		color: var(--dct-legend-nav-color, currentColor);
		cursor: pointer;
	}
	.dct-discrete-paginated__btn:hover:not(:disabled) {
		background: var(--dct-legend-nav-hover-bg, color-mix(in srgb, currentColor 10%, transparent));
	}
	.dct-discrete-paginated__btn:disabled {
		opacity: var(--dct-legend-nav-disabled-opacity, 0.3);
		cursor: default;
	}
</style>
