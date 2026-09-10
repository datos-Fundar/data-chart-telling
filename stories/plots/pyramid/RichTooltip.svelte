<script lang="ts">
  import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import TooltipCard from '../../common/TooltipCard.svelte';
  import { AGE_GROUPS, POPULATION_PYRAMID, type PopulationRow } from '../../data/population-pyramid';

  const cfg = getConfiguration();
  const DATA = POPULATION_PYRAMID.filter((d) => d.year === 2022);

  // Series are sorted alphabetically inside PyramidPlot ('Female' < 'Male'),
  // which is also what drives left/right placement and colour assignment —
  // kept in lockstep here since `content` only gets the raw rows back, not
  // their resolved side/colour.
  const SERIES_COLORS: Record<string, string> = {
    Female: paletteColor(0, cfg.palette),
    Male: paletteColor(1, cfg.palette),
  };
</script>

{#snippet content({ rows }: { rows: PopulationRow[] })}
  {@const ageGroup = rows[0]?.ageGroup}
  {@const entries = rows
    .map((row) => ({
      label: row.sex,
      color: SERIES_COLORS[row.sex],
      value: row.pct,
      display: `${row.pct.toFixed(1)}%`,
    }))
    .sort((a, b) => b.value - a.value)}
  <TooltipCard heading={ageGroup} {entries} footer="Share of total population" />
{/snippet}

<div class="rich-tooltip-demo">
  <PyramidPlot
    width={950}
    height={520}
    data={DATA}
    x="pct"
    y="ageGroup"
    z="sex"
    scales={{ y: { domain: AGE_GROUPS } }}
    tooltip={{
      facetId: '',
      sync: false,
      format: (row) => {
        const { sex, ageGroup, pct } = row as PopulationRow;
        return `${sex} - ${ageGroup}: ${pct.toFixed(1)}%`;
      },
      content,
    }}
  />
</div>
