<script lang="ts">
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import TooltipCard from '../../common/TooltipCard.svelte';
  import {
    FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
    MALE_LIFE_EXPECTANCY_BY_PROVINCE,
    type ProvincePoint,
  } from './data';

  const cfg = getConfiguration();

  // Series order matches the `series` array below, which is what drives
  // colour assignment inside BarPlot — kept in lockstep here since `content`
  // only gets the raw rows back, not their series name/colour.
  const SERIES_LABELS = ['Female', 'Male'];
  const SERIES_COLORS = [paletteColor(0, cfg.palette), paletteColor(1, cfg.palette)];
</script>

{#snippet content({ rows }: { rows: ProvincePoint[] })}
  {@const province = rows[0]?.province}
  {@const entries = rows
    .map((row, i) => ({
      label: SERIES_LABELS[i],
      color: SERIES_COLORS[i],
      value: row.value,
      display: `${row.value.toFixed(1)} yr`,
    }))
    .sort((a, b) => b.value - a.value)}
  <TooltipCard heading={province} {entries} footer="Life expectancy at birth" />
{/snippet}

<div class="rich-tooltip-demo">
  <BarPlot
    width={950}
    height={500}
    series={[
      { name: 'female', x: 'province', y: 'value', data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE },
      { name: 'male', x: 'province', y: 'value', data: MALE_LIFE_EXPECTANCY_BY_PROVINCE },
    ]}
    tooltip={{
      facetId: '',
      sync: false,
      format: (row) => {
        const { province, value } = row as ProvincePoint;
        return `${province}: ${value.toFixed(1)} yr`;
      },
      content,
    }}
  />
</div>
