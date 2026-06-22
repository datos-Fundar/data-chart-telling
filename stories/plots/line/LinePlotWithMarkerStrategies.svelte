<script lang="ts">
  import LinePlot from '$lib/plots/line/Plot.svelte';
  import PeakMarker from '$lib/plots/markers/PeakMarker.svelte';
  import type { Series } from '$lib/types/plots/common';
  import type { SegmentsMap } from '$lib/types/plots/styles';
  import type { Marker } from '$lib/types/plots/markers';

  type YearPoint = { year: number; value: number };

  const SERIES1: YearPoint[] = [
    { year: 2018, value: 30 },
    { year: 2019, value: 35 },
    { year: 2020, value: 28 },
    { year: 2021, value: 40 },
    { year: 2022, value: 38 },
  ];

  const SERIES2: YearPoint[] = [
    { year: 2018, value: 50 },
    { year: 2019, value: 55 },
    { year: 2020, value: 48 },
    { year: 2021, value: 65 },
    { year: 2022, value: 62 },
  ];

  const SERIES3: YearPoint[] = [
    { year: 2018, value: 20 },
    { year: 2019, value: 28 },
    { year: 2020, value: 15 },
    { year: 2021, value: 32 },
    { year: 2022, value: 25 },
  ];

  const SERIES4: YearPoint[] = [
    { year: 2018, value: 60 },
    { year: 2019, value: 70 },
    { year: 2020, value: 45 },
    { year: 2021, value: 58 },
    { year: 2022, value: 68 },
  ];

  const series: Series<YearPoint>[] = [
    { name: 'series1', x: 'year', y: 'value', data: SERIES1 },
    { name: 'series2', x: 'year', y: 'value', data: SERIES2 },
    { name: 'series3', x: 'year', y: 'value', data: SERIES3 },
    { name: 'series4', x: 'year', y: 'value', data: SERIES4 },
  ];

  const segments: SegmentsMap = {
    series1: [{ style: {} }],
    series2: [{ style: {} }],
    series3: [
      { to: 2020, style: {} },
      { from: 2020, style: { stroke: { strokeDasharray: '6 4' } } },
    ],
    series4: [
      { to: 2020, style: {} },
      { from: 2020, style: { stroke: { strokeDasharray: '6 4' } } },
    ],
  };

  const markers: Marker[] = [
    // Series 2: Single peak marker (no segments or strategy='series')
    {
      type: 'component',
      series: 'series2',
      component: PeakMarker,
      props: {
        yProp: 'value',
        xProp: 'year',
        mode: 'max',
        label: 'Max',
      },
    } satisfies Marker,

    // Series 3: Peak per segment
    {
      type: 'component',
      series: 'series3',
      component: PeakMarker,
      strategy: 'segment',
      props: {
        yProp: 'value',
        xProp: 'year',
        mode: 'max',
        label: 'Max',
      },
    } satisfies Marker,

    // Series 4: Single peak for entire series (despite having segments)
    {
      type: 'component',
      series: 'series4',
      component: PeakMarker,
      strategy: 'series',
      props: {
        yProp: 'value',
        xProp: 'year',
        mode: 'max',
        label: 'Max',
      },
    } satisfies Marker,
  ];
</script>

<LinePlot
  width={600}
  height={400}
  {series}
  {segments}
  {markers}
/>