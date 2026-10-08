<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * Tiny demo helper: a 0-1 range input that mimics the scroll `progress` a
   * scrolly-telling host would feed the timeline. Renders its child with the
   * current value so stories can show a genuinely interactive timeline.
   */
  let {
    initial = 0.5,
    children,
  }: {
    initial?: number;
    children: Snippet<[{ progress: number }]>;
  } = $props();

  // svelte-ignore state_referenced_locally
  let progress = $state(initial);
</script>

<div class="scrubber">
  <label class="scrubber__control">
    <span>progress</span>
    <input type="range" min="0" max="1" step="0.01" bind:value={progress} />
    <code>{progress.toFixed(2)}</code>
  </label>
  {@render children({ progress })}
</div>

<style>
  .scrubber {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .scrubber__control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    font-family: ui-monospace, monospace;
  }
  .scrubber__control input {
    flex: 1 1 220px;
    max-width: 320px;
  }
</style>
