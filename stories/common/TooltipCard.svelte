<script lang="ts">
  type Entry = { label: string; color: string; value: number; display: string };

  let { heading, entries, footer }: { heading: string; entries: Entry[]; footer: string } = $props();
</script>

<div class="rich-tooltip">
  <div class="rich-tooltip__header">{heading}</div>
  <div class="rich-tooltip__body">
    {#each entries as entry (entry.label)}
      <div class="rich-tooltip__row">
        <span class="rich-tooltip__label">
          <span class="rich-tooltip__swatch" style:background={entry.color}></span>
          {entry.label}
        </span>
        <span class="rich-tooltip__value">{entry.display}</span>
      </div>
    {/each}
  </div>
  <div class="rich-tooltip__footer">{footer}</div>
</div>

<style>
  .rich-tooltip {
    min-width: 200px;
    background: #fff;
    color: #1f2937;
    border-radius: 0.75rem;
    overflow: hidden;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }

  .rich-tooltip__header {
    padding: 0.6rem 0.9rem;
    font-weight: 700;
    font-size: 1rem;
    text-transform: capitalize;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .rich-tooltip__body {
    padding: 0.2rem 0.9rem;
  }

  .rich-tooltip__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0.35rem 0;
    font-size: 0.85rem;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
  }

  .rich-tooltip__row:last-child {
    border-bottom: none;
  }

  .rich-tooltip__label {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .rich-tooltip__swatch {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .rich-tooltip__value {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .rich-tooltip__footer {
    padding: 0.45rem 0.9rem;
    font-size: 0.7rem;
    font-style: italic;
    color: rgba(0, 0, 0, 0.5);
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    background: rgba(0, 0, 0, 0.02);
  }
</style>
