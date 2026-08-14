<script lang="ts">
  import TimelineLayout from '$lib/layout/timeline/TimelineLayout.svelte';
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import Scrubber from '../../common/Scrubber.svelte';
  import type { Orientation } from '$lib/types/layout/timeline';

  /**
   * `Timeline` on its own is purely visual — it just draws the steps you hand
   * it. `TimelineLayout` is the layer that actually couples it to data: it
   * picks the step from `progress`, slices the data down to it, and hands the
   * plot its measured box. This wrapper exists only because that coupling
   * needs a `child` snippet, which a plain `.stories.ts` args object can't
   * express.
   */
  let {
    orientation = 'vertical',
    width = 680,
    height = 420,
  }: {
    orientation?: Orientation;
    width?: number;
    height?: number;
  } = $props();

  type Row = { year: number; region: string; value: number };
  const YEARS = [2018, 2019, 2020, 2021, 2022];
  const REGIONS = ['Norte', 'Centro', 'Sur', 'Este', 'Oeste'];
  const data: Row[] = YEARS.flatMap((year) =>
    REGIONS.map((region, i) => ({
      year,
      region,
      value: Math.round(30 + 10 * i + 6 * Math.sin(year - 2018 + i)),
    })),
  );
</script>

<Scrubber>
  {#snippet children({ progress })}
    <TimelineLayout {data} accessor="year" {progress} {orientation} {width} {height}>
      {#snippet child({ data: rows, width: w, height: h })}
        <BarPlot
          width={w}
          height={h}
          series={[{ name: 'region', x: 'region', y: 'value', data: rows }]}
        />
      {/snippet}
    </TimelineLayout>
  {/snippet}
</Scrubber>
