<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { Plot, BarY, AxisX, AxisY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils';
  import type { BarSeries } from '$lib/types/plots/bars';

  let {
    width,
    height,
    series,
  }: {
    width: number;
    height: number;
    series: BarSeries<TData>[];
  } = $props();
</script>

<Plot
  {width}
  {height}
  margin={{ left: 30, right: 20, top: 20, bottom: 20 }}
  x={{ type: 'band', padding: 0.2 }}
>
  <AxisX tickSize={5} tickPadding={10} tickFontSize={14} />
  <AxisY tickSize={0} tickPadding={10} tickFontSize={14} />

  {#each series as s (s.name)}
    <BarY
      data={s.data}
      x={resolveAccessor(s.x)}
      y={resolveAccessor(s.y)}
      fill={s.fill}
      fillOpacity={s.fillOpacity ?? 1}
    />
  {/each}
</Plot>
