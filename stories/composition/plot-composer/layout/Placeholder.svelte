<script lang="ts">
	/** Stand-in for a plot: shows the panel's label and the box it was handed. */
	let { label, width, height }: { label: string; width: number; height: number } = $props();
</script>

<div class="placeholder" style:width="{width}px" style:height="{height}px">
	<strong>{label}</strong>
	<span>{Math.round(width)} × {Math.round(height)}</span>
</div>

<style>
	.placeholder {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		border: 1px dashed currentColor;
		background: color-mix(in srgb, currentColor 8%, transparent);
		font-size: 12px;
	}
	strong {
		font-size: 18px;
	}
	span {
		opacity: 0.6;
	}
</style>
