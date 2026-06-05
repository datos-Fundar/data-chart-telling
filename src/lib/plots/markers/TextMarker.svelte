<script lang="ts">
  import { Text } from 'svelteplot';

  interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any[];
    x?: number | (() => number);
    y?: number | (() => number);
    text?: string;
    fill?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textAnchor?: 'start' | 'middle' | 'end';
    dx?: number;
    dy?: number;
  }

  const {
    data = [],
    x,
    y,
    text = '',
    fill = 'currentColor',
    fontSize = 12,
    fontWeight = 'normal',
    fontStyle = 'normal',
    textAnchor = 'middle',
    dx = 0,
    dy = 0,
  }: Props = $props();

  const xAccessor = $derived(typeof x === 'function' ? x : () => x ?? 0);
  const yAccessor = $derived(typeof y === 'function' ? y : () => y ?? 0);
  const displayData = $derived(data.length > 0 ? data : [{}]);
</script>

{#if text}
  <Text
    data={displayData}
    x={xAccessor}
    y={yAccessor}
    text={() => text}
    {fill}
    {fontSize}
    {fontWeight}
    {fontStyle}
    {textAnchor}
    {dx}
    {dy}
  />
{/if}
