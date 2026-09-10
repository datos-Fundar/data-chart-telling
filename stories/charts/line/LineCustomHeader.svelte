<script lang="ts">
  import LineChart from '$lib/charts/line/Chart.svelte';
  import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';

  const data = TIME_SERIES.filter((d) => d.region === 'North');
</script>

<LineChart
  width={680}
  height={460}
  {data}
  x="year"
  y="value"
  z={'metric' as keyof SeriesPoint}
  legend={[{
    type: 'discrete',
    title: 'Indicador',
    items: [{ name: 'GDP', symbol: 'line' }, { name: 'Employment', symbol: 'line' }],
    columns: 2,
  }]}
>
  {#snippet header()}
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
      <div>
        <h3 style="margin:0 0 0.3rem; font-size:1.5rem; font-weight:600; line-height:1.2; color:#2563eb;">
          PBI vs. Empleo
        </h3>
        <span style="font-size:1rem; color:color-mix(in srgb, currentColor 70%, transparent);">
          Región Norte · comparativa anual
        </span>
      </div>

      <div style="flex-shrink:0; display:flex; align-items:center; gap:0.5rem; opacity:0.8;">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          aria-label="DataTelling"
        >
          <rect width="32" height="32" rx="6" fill="#2563eb"/>
          <rect x="6" y="18" width="4" height="8" rx="1" fill="white"/>
          <rect x="14" y="12" width="4" height="14" rx="1" fill="white"/>
          <rect x="22" y="7" width="4" height="19" rx="1" fill="white"/>
          <polyline
            points="8,17 16,11 24,6"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
            opacity="0.5"
          />
        </svg>
        <span style="font-size:0.75rem; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; color:currentColor;">
          DataTelling
        </span>
      </div>
    </div>
  {/snippet}

  {#snippet footer()}
    <div style="display:flex; justify-content:space-between; align-items:baseline; gap:1rem; font-size:0.75rem; color:color-mix(in srgb, currentColor 65%, transparent);">
      <span>
        Fuente: INDEC · Serie desestacionalizada (SAAR). Las cifras de 2023 son proyecciones
        preliminares sujetas a revisión metodológica.
      </span>
      <span style="flex-shrink:0; font-variant-numeric:tabular-nums;">
        Actualizado: Q3 2024
      </span>
    </div>
  {/snippet}
</LineChart>
