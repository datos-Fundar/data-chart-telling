<script lang="ts">
  /**
   * Default position badge for `carousel`/`paginated` facet modes. Styled from
   * the `--dct-facet-indicator-*` config vars; positioning is owned by the
   * parent that renders it.
   */
  let {
    current,
    total,
    format,
  }: {
    current: number;
    total: number;
    format?: (current: number, total: number) => string;
  } = $props();

  const text = $derived(format ? format(current, total) : `${current} / ${total}`);
</script>

<div class="dct-facet-indicator">{text}</div>

<style>
  .dct-facet-indicator {
    padding: var(--dct-facet-indicator-pad, 0.125rem 0.5rem);
    border-radius: var(--dct-facet-indicator-radius, 999px);
    font-size: var(--dct-facet-indicator-size, 0.8125rem);
    background: var(--dct-facet-indicator-bg, #111827);
    color: var(--dct-facet-indicator-color, #fff);
    pointer-events: none;
  }
</style>
