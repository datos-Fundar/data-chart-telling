<script lang="ts" generics="TData = Record<string, unknown>">
  import { Text } from 'svelteplot';
  import type { TextMarkerConfig } from '$lib/types/markers/common';

  /** Renders one `'text'` marker. `x`/`y` also accept a literal number/Date (every row draws at that fixed position). */
  const { marker }: { marker: TextMarkerConfig } = $props();

  const data = $derived((marker.data ?? []) as TData[]);
  const x = $derived(marker.x);
  const y = $derived(marker.y);
  const text = $derived(marker.text ?? '');
  const styles = $derived(marker.styles);

  const displayData = $derived(data.length > 0 ? data : [{} as TData]);
  const fill = $derived(styles?.fill ?? 'currentColor');
  const fontSize = $derived(styles?.fontSize ?? 12);
  const fontWeight = $derived(styles?.fontWeight ?? 'normal');
  const fontStyleProp = $derived(styles?.fontStyle ?? 'normal');
  // 'outside' is meant to be resolved per-point by the caller (see
  // HoverMarker, which knows each point's signed x); a caller that passes it
  // through unresolved falls back to 'start' rather than an invalid svelteplot value.
  const textAnchor = $derived(styles?.textAnchor === 'outside' ? 'start' : (styles?.textAnchor ?? 'middle'));
  const lineAnchor = $derived(styles?.lineAnchor ?? 'middle');
  const dx = $derived(styles?.dx ?? 0);
  const dy = $derived(styles?.dy ?? 0);
</script>

{#if text}
  <Text
    data={displayData}
    x={x ?? 0}
    y={y ?? 0}
    text={text ?? ''}
    {dx}
    {dy}
    {fill}
    {fontSize}
    {fontWeight}
    {textAnchor}
    {lineAnchor}
    fontStyle={fontStyleProp}
    lineHeight={styles?.lineHeight}
    rotate={styles?.rotate}
    stroke={styles?.stroke}
    strokeWidth={styles?.strokeWidth}
    paintOrder={styles?.paintOrder}
    class={styles?.class}
    textClass={styles?.textClass}
  />
{/if}
