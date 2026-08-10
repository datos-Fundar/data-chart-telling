<script lang="ts">
  import LinePlot from '$lib/plots/line/Plot.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import TooltipCard from '../../common/TooltipCard.svelte';
  import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY, type YearPoint } from './data';

  const cfg = getConfiguration();

  // Series order matches the `series` array below, which is what drives
  // colour assignment inside LinePlot — kept in lockstep here since `content`
  // only gets the raw rows back, not their series name/colour.
  const SERIES_LABELS = ['Female', 'Male'];
  const SERIES_COLORS = [paletteColor(0, cfg.palette), paletteColor(1, cfg.palette)];
</script>

{#snippet content({ rows }: { rows: YearPoint[] })}
  {@const year = rows[0]?.year}
  {@const entries = rows
    .map((row, i) => ({
      label: SERIES_LABELS[i],
      color: SERIES_COLORS[i],
      value: row.value,
      display: `${row.value.toFixed(1)} yr`,
    }))
    .sort((a, b) => b.value - a.value)}
  <TooltipCard heading={String(year)} {entries} footer="Life expectancy at birth" />
{/snippet}

<div class="rich-tooltip-demo">
  <LinePlot
    width={950}
    height={400}
    series={[
      { name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY },
      { name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY },
    ]}
    tooltip={{
      facetId: '',
      sync: false,
      format: (row) => {
        const { year, value } = row as YearPoint;
        return `${year}: ${value.toFixed(1)} yr`;
      },
      content,
    }}
  />
</div>
