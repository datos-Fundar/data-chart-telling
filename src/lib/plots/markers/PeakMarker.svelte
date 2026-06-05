<script lang="ts">
  import DotMarker from './DotMarker.svelte';
  import TextMarker from './TextMarker.svelte';

  interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any[];
    yProp?: string;
    xProp?: string;
    mode?: 'max' | 'min';
    label?: string;
    dotRadius?: number;
    dotFill?: string;
    dotStroke?: string;
    dotStrokeWidth?: number;
    textFill?: string;
    textFontSize?: number;
    textFontWeight?: 'normal' | 'bold';
    textDx?: number;
    textDy?: number;
    seriesColor?: string;
  }

  const {
    data = [],
    yProp = 'value',
    xProp = 'x',
    mode = 'max',
    label,
    dotRadius = 5,
    dotFill,
    dotStroke,
    dotStrokeWidth = 2,
    textFill,
    textFontSize = 14,
    textFontWeight = 'bold',
    textDx = 0,
    textDy = -15,
    seriesColor,
  }: Props = $props();

  const resolvedDotFill = $derived(dotFill ?? seriesColor ?? '#fbbf24');
  const resolvedDotStroke = $derived(dotStroke ?? seriesColor ?? '#f59e0b');
  const resolvedTextFill = $derived(textFill ?? seriesColor ?? '#f59e0b');

  const peakPoint = $derived.by(() => {
    if (data.length === 0) return null;

    return data.reduce((peak, current) => {
      const currentY = current[yProp];
      const peakY = peak[yProp];

      if (mode === 'max') {
        return currentY > peakY ? current : peak;
      } else {
        return currentY < peakY ? current : peak;
      }
    });
  });

  const peakX = $derived(peakPoint ? peakPoint[xProp] : null);
  const peakY = $derived(peakPoint ? peakPoint[yProp] : null);
</script>

{#if peakPoint}
  <DotMarker
    data={[peakPoint]}
    x={() => peakX}
    y={() => peakY}
    r={dotRadius}
    fill={resolvedDotFill}
    stroke={resolvedDotStroke}
    strokeWidth={dotStrokeWidth}
  />
  {#if label}
    <TextMarker
      data={[peakPoint]}
      x={() => peakX}
      y={() => peakY}
      text={label}
      fill={resolvedTextFill}
      fontSize={textFontSize}
      fontWeight={textFontWeight}
      dx={textDx}
      dy={textDy}
    />
  {/if}
{/if}
