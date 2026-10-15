<script lang="ts">
	import type { TimelineState } from '$lib/layout/timeline/TimelineState.svelte';

	/**
	 * A timeline drawn as a player bar: play and pause, the current step, a
	 * slider over the steps, and a speed and a loop button - each only when the
	 * timeline's `controls` list it, in that order. It draws the
	 * {@link TimelineState} it is handed and tells it what the reader does;
	 * every size and color comes from the `--dct-player-*` custom properties
	 * (the configuration's `timeline.player`).
	 */
	let { timeline }: { timeline: TimelineState } = $props();

	const last = $derived(Math.max(0, timeline.steps.length - 1));
	const percent = $derived(timeline.progress * 100);

	function onkeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		if (event.key !== ' ' || target.closest('button')) return;
		event.preventDefault();
		timeline.toggle();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="dct-player" role="group" aria-label="Timeline" {onkeydown}>
	{#each timeline.controls as control (control)}
		{#if control === 'play'}
			<button
				type="button"
				class="dct-player__play"
				aria-label={timeline.playing ? 'Pause' : 'Play'}
				onclick={() => timeline.toggle()}
			>
				<svg viewBox="0 0 16 16" width="55%" height="55%" aria-hidden="true">
					{#if timeline.playing}
						<path fill="currentColor" d="M4 2h3v12H4zM9 2h3v12H9z" />
					{:else}
						<path fill="currentColor" d="M4 2l10 6-10 6z" />
					{/if}
				</svg>
			</button>
		{:else if control === 'value'}
			<span class="dct-player__value" aria-live="off">
				{timeline.value === undefined ? '' : timeline.format(timeline.value)}
			</span>
		{:else if control === 'slider'}
			<input
				type="range"
				class="dct-player__slider"
				aria-label="Step"
				min="0"
				max={last}
				step="1"
				value={Math.max(0, timeline.index)}
				style:--dct-player-progress="{percent}%"
				oninput={(event) => timeline.seekIndex(Number(event.currentTarget.value))}
			/>
		{:else if control === 'speed'}
			<button
				type="button"
				class="dct-player__toggle"
				aria-label="Speed"
				onclick={() => timeline.cycleSpeed()}
			>
				×{timeline.speed}
			</button>
		{:else if control === 'loop'}
			<button
				type="button"
				class="dct-player__toggle"
				class:dct-player__toggle--active={timeline.loop}
				aria-label="Loop"
				aria-pressed={timeline.loop}
				onclick={() => timeline.setLoop(!timeline.loop)}
			>
				<svg viewBox="0 0 16 16" width="1.1em" height="1.1em" aria-hidden="true">
					<path
						fill="none"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 7V6a2 2 0 0 1 2-2h7M10 1.5 12.5 4 10 6.5M13 9v1a2 2 0 0 1-2 2H4M6 14.5 3.5 12 6 9.5"
					/>
				</svg>
			</button>
		{/if}
	{/each}
</div>

<style>
	.dct-player {
		display: flex;
		align-items: center;
		gap: var(--dct-player-gap, 1rem);
		padding: var(--dct-player-pad, 0.5rem 1rem);
		border-radius: var(--dct-player-radius, 0.5rem);
		background: var(--dct-player-bg, transparent);
		color: var(--dct-player-color, currentColor);
		font-size: var(--dct-player-size, 0.875rem);
		font-weight: var(--dct-player-weight, 500);
	}

	.dct-player__play {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--dct-player-button-size, 2rem);
		height: var(--dct-player-button-size, 2rem);
		padding: 0;
		border: none;
		border-radius: var(--dct-player-button-radius, 999px);
		background: var(--dct-player-button-bg, #e6580d);
		color: var(--dct-player-button-color, #fff);
		cursor: pointer;
	}
	.dct-player__play:hover {
		background: var(--dct-player-button-hover-bg, var(--dct-player-button-bg, #e6580d));
	}

	.dct-player__value {
		flex: 0 0 auto;
		min-width: var(--dct-player-value-width, 3rem);
		font-variant-numeric: tabular-nums;
	}

	.dct-player__slider {
		flex: 1 1 auto;
		min-width: 0;
		height: var(--dct-player-thumb-size, 14px);
		margin: 0;
		background: transparent;
		appearance: none;
		cursor: pointer;
	}
	.dct-player__slider::-webkit-slider-runnable-track {
		height: var(--dct-player-track-height, 3px);
		border-radius: var(--dct-player-track-radius, 999px);
		background: linear-gradient(
			to right,
			var(--dct-player-track-fill, currentColor) var(--dct-player-progress, 0%),
			var(--dct-player-track-color, currentColor) var(--dct-player-progress, 0%)
		);
	}
	.dct-player__slider::-moz-range-track {
		height: var(--dct-player-track-height, 3px);
		border-radius: var(--dct-player-track-radius, 999px);
		background: var(--dct-player-track-color, currentColor);
	}
	.dct-player__slider::-moz-range-progress {
		height: var(--dct-player-track-height, 3px);
		border-radius: var(--dct-player-track-radius, 999px);
		background: var(--dct-player-track-fill, currentColor);
	}
	.dct-player__slider::-webkit-slider-thumb {
		appearance: none;
		width: var(--dct-player-thumb-size, 14px);
		height: var(--dct-player-thumb-size, 14px);
		margin-top: calc((var(--dct-player-track-height, 3px) - var(--dct-player-thumb-size, 14px)) / 2);
		border: none;
		border-radius: 50%;
		background: var(--dct-player-thumb-color, currentColor);
	}
	.dct-player__slider::-moz-range-thumb {
		width: var(--dct-player-thumb-size, 14px);
		height: var(--dct-player-thumb-size, 14px);
		border: none;
		border-radius: 50%;
		background: var(--dct-player-thumb-color, currentColor);
	}

	.dct-player__toggle {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		padding: var(--dct-player-toggle-pad, 0.125rem 0.5rem);
		border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
		border-radius: var(--dct-player-toggle-radius, 0.375rem);
		background: var(--dct-player-toggle-bg, transparent);
		color: var(--dct-player-toggle-color, currentColor);
		font: inherit;
		font-size: var(--dct-player-toggle-size, 0.75rem);
		font-variant-numeric: tabular-nums;
		cursor: pointer;
	}
	.dct-player__toggle--active {
		border-color: transparent;
		background: var(--dct-player-toggle-active-bg, currentColor);
		color: var(--dct-player-toggle-active-color, #fff);
	}
</style>
