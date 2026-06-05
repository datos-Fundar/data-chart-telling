<script lang="ts">
  import { Dot } from 'svelteplot';

  interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any[];
    x?: number | (() => number);
    y?: number | (() => number);
    r?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
  }

  const {
    data = [],
    x,
    y,
    r = 5,
    fill = 'currentColor',
    stroke = 'currentColor',
    strokeWidth = 1,
    fillOpacity = 1,
    strokeOpacity = 1,
  }: Props = $props();

  const xAccessor = $derived(typeof x === 'function' ? x : () => x ?? 0);
  const yAccessor = $derived(typeof y === 'function' ? y : () => y ?? 0);
  const displayData = $derived(data.length > 0 ? data : [{}]);
</script>

<Dot
  data={displayData}
  x={xAccessor}
  y={yAccessor}
  {r}
  {fill}
  {stroke}
  strokeWidth={strokeWidth}
  {fillOpacity}
  {strokeOpacity}
/>
