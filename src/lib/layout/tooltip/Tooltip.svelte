<script lang="ts" generics="TRow extends Record<string, unknown>">
	import type { Snippet } from 'svelte';
	import { TooltipState } from '$lib/layout/tooltip/TooltipState.svelte';
	import type { TooltipAnchorX, TooltipAnchorY } from '$lib/types/layout/tooltip';

	/**
	 * A plot's floating tooltip at `(x, y)`, inside a `position: relative`
	 * parent and themed by the `--dct-tooltip-*` variables. It reads the rows
	 * the hover matched: its own `content` snippet, given every row, or each
	 * row's `format` text, one per line. It sits at `anchorX`/`anchorY` of the
	 * point (default right and below) and moves over where it would leave its
	 * plot's box - or `bounds`, when given. See {@link TooltipState}.
	 */
	let {
		visible,
		x,
		y,
		rows,
		format,
		content,
		bounds,
		anchorX = 'right',
		anchorY = 'bottom',
		background,
		color
	}: {
		visible: boolean;
		x: number;
		y: number;
		/** Every row the hover matched. */
		rows: TRow[];
		format: (row: TRow) => string;
		/** Custom tooltip body, given every row; replaces the `format` text and the default box. */
		content?: Snippet<[{ rows: TRow[] }]>;
		/** Box the tooltip must stay within. Defaults to its plot's box. */
		bounds?: { width: number; height: number };
		/** Preferred horizontal side of the point. Defaults to `'right'`. */
		anchorX?: TooltipAnchorX;
		/** Preferred vertical side of the point. Defaults to `'bottom'`. */
		anchorY?: TooltipAnchorY;
		background?: string;
		color?: string;
	} = $props();

	const tooltip = new TooltipState({
		point: () => ({ x, y }),
		anchor: () => ({ x: anchorX, y: anchorY }),
		bounds: () => bounds
	});
</script>

{#if visible}
	<div
		class="dct-tooltip"
		class:dct-tooltip--plain={!!content}
		bind:clientWidth={tooltip.width}
		bind:clientHeight={tooltip.height}
		style:left="{tooltip.box.left}px"
		style:top="{tooltip.box.top}px"
		style:background
		style:color
	>
		{#if content}
			{@render content({ rows })}
		{:else}
			{TooltipState.text(rows, format)}
		{/if}
	</div>
{/if}

<style>
	.dct-tooltip {
		position: absolute;
		z-index: 10;
		pointer-events: none;
		background: var(--dct-tooltip-bg, #111827);
		color: var(--dct-tooltip-color, #fff);
		font-size: var(--dct-tooltip-size, 0.8125rem);
		padding: var(--dct-tooltip-pad, 0.5rem 0.75rem);
		border-radius: var(--dct-tooltip-radius, 0.375rem);
		border: var(--dct-tooltip-border, none);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
		white-space: pre-line;
		line-height: 1.35;
	}

	.dct-tooltip--plain {
		background: transparent;
		padding: 0;
		border: none;
	}
</style>
