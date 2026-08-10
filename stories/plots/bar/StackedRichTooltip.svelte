<script lang="ts">
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import type { AxisBasedScalesConfig } from '$lib/types/plots/props';
  import TooltipCard from '../../common/TooltipCard.svelte';
  import { AGE_BRACKET_BY_PROVINCE, AGE_BRACKETS, provinceSort, type AgeBracketPoint } from './data';

  const cfg = getConfiguration();

  // Colour order matches AGE_BRACKETS, which is what drives colour assignment
  // inside BarPlot when series are auto-created from `z` — kept in lockstep
  // here since `content` only gets the raw rows back, not their colour.
  const BRACKET_COLORS = AGE_BRACKETS.map((_, i) => paletteColor(i, cfg.palette));
</script>

{#snippet content({ rows }: { rows: AgeBracketPoint[] })}
  {@const province = rows[0]?.province}
  {@const entries = rows
    .map((row) => ({
      label: row.bracket,
      color: BRACKET_COLORS[AGE_BRACKETS.indexOf(row.bracket)],
      value: row.value,
      display: `${row.value.toFixed(2)}%`,
    }))
    .sort((a, b) => b.value - a.value)}
  <TooltipCard heading={province} {entries} footer="Distribución etaria proyectada, 2040" />
{/snippet}

<div class="rich-tooltip-demo">
  <BarPlot
    width={900}
    height={900}
    data={AGE_BRACKET_BY_PROVINCE}
    x="province"
    y="value"
    z="bracket"
    scales={{
      y: { type: 'categorical', sort: provinceSort },
      z: { seriesLayout: 'stacked' },
    } satisfies AxisBasedScalesConfig}
    markers={[{ type: 'hover', showLabels: false }]}
    tooltip={{
      facetId: '',
      sync: false,
      format: (row) => {
        const { province, bracket, value } = row as AgeBracketPoint;
        return `${province} / ${bracket}: ${value}`;
      },
      content,
    }}
  />
</div>
