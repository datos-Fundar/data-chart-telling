<script lang="ts">
  import DotMarker from './DotMarker.svelte';
  import TextMarker from './TextMarker.svelte';
  import type { MarkerProps } from '$lib/types/plots/markers';
  import type { DotStyle, FontStyle } from '$lib/types/plots/styles';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Props extends MarkerProps<Record<string, any>> {
    yProp?: string;
    xProp?: string;
    mode?: 'max' | 'min';
    label?: string;
    dotStyle?: DotStyle;
    textStyle?: FontStyle;
  }

  const {
    data = [],
    yProp = 'value',
    xProp = 'x',
    mode = 'max',
    label,
    dotStyle,
    textStyle,
    seriesColor,
  }: Props = $props();

  const resolvedDotFill = $derived(dotStyle?.dotFill ?? seriesColor ?? 'currentColor');
  const resolvedDotStroke = $derived(dotStyle?.dotStroke ?? seriesColor ?? 'currentColor');
  const resolvedTextFill = $derived(textStyle?.fill ?? seriesColor ?? 'currentColor');

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

  const resolvedDotStyle = $derived<DotStyle>({
    ...dotStyle,
    dotFill: resolvedDotFill,
    dotStroke: resolvedDotStroke,
  });

  const resolvedTextStyle = $derived<FontStyle>({
    ...textStyle,
    fill: resolvedTextFill,
    fontWeight: textStyle?.fontWeight ?? 'bold',
    dy: textStyle?.dy ?? -15,
  });
</script>

{#if peakPoint}
  <DotMarker
    data={[peakPoint]}
    x={() => peakX}
    y={() => peakY}
    style={resolvedDotStyle}
  />
  {#if label}
    <TextMarker
      data={[peakPoint]}
      x={() => peakX}
      y={() => peakY}
      text={label}
      style={resolvedTextStyle}
    />
  {/if}
{/if}
