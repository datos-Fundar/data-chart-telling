<script lang="ts">
  import LinePlot from '$lib/plots/line/Plot.svelte';
  import PeakMarker from '$lib/plots/markers/PeakMarker.svelte';
  import type { LineSeries, SegmentsMap } from '$lib/types/plots/lines';
  import type { Marker } from '$lib/types/plots/markers';

  type YearPoint = { year: number; value: number };

  const GDP: YearPoint[] = [
    { year: 2018, value: 42 },
    { year: 2019, value: 48 },
    { year: 2020, value: 31 },
    { year: 2021, value: 55 },
    { year: 2022, value: 61 },
  ];

  const markers: Marker[] = [
    {
      type: 'component',
      series: 'gdp',
      component: PeakMarker,
      props: {
        yProp: 'value',
        xProp: 'year',
        mode: 'max',
        label: 'Peak GDP',
      },
    } satisfies Marker,
  ];
</script>

<LinePlot
  width={600}
  height={400}
  series={[{ name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies LineSeries<YearPoint>]}
  segments={{
    gdp: [{ style: { stroke: '#4f46e5', strokeWidth: 3 } }],
  } satisfies SegmentsMap}
  {markers}
/>
