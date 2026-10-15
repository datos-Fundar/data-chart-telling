<script lang="ts">
  import { Plot, RuleX, RuleY, Text } from 'svelteplot';
  import { TimelineSteps } from '$lib/layout/timeline/TimelineSteps';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import type { Orientation, TimeValue } from '$lib/types/layout/timeline';

  /**
   * Purely visual time axis: a baseline rule plus the ordered step labels with
   * the current step emphasised. It has no notion of data - it just draws the
   * `values` it is handed and highlights `currentValue`. Colours come from CSS
   * variables so a host app can theme it, and sizes and opacities from the
   * configuration's `timeline.rule`.
   */
  let {
    currentValue,
    values,
    orientation = 'vertical',
    width,
    height,
  }: {
    currentValue: TimeValue;
    values: TimeValue[];
    orientation?: Orientation;
    width: number;
    height: number;
  } = $props();

  const config = $derived(getConfiguration());
  const rule = $derived(config.timeline.rule);

  const isHorizontal = $derived(orientation === 'horizontal');
  const crossKey = $derived(isHorizontal ? 'y' : 'x');

  const domain = $derived(new TimelineSteps(values).domain);

  const baseValues = $derived(values.filter((v) => v !== currentValue));
  const identity = (d: TimeValue) => d;

  const Rule = $derived(isHorizontal ? RuleY : RuleX);

  const textOffset = $derived(
    isHorizontal
      ? { dy: -12, dx: 0, textAnchor: 'middle' as const }
      : { dx: -8, dy: 0, textAnchor: 'end' as const },
  );

  const axisConfig = $derived(
    isHorizontal
      ? { x: { domain, ticks: [] }, y: { axis: false as const } }
      : { y: { domain, ticks: [], reverse: true }, x: { axis: false as const } },
  );
</script>

<!-- Drawn with the configuration's font even outside a figure's chrome, which would hand it down. -->
<div style="display: contents" style:font-family={config.font}>
<Plot
  {width}
  {height}
  {...axisConfig}
  marginTop={isHorizontal ? 32 : 0}
  marginBottom={0}
  marginLeft={isHorizontal ? 30 : 50}
  marginRight={isHorizontal ? 30 : 0}
>
  <Rule
    {...{ [crossKey]: 0 }}
    stroke="var(--dct-timeline-axis, currentColor)"
    strokeOpacity={rule.axisOpacity}
    strokeWidth={rule.axisWidth}
  />

  <Text
    data={baseValues}
    {...(isHorizontal ? { x: identity, y: 0 } : { x: 0, y: identity })}
    text={(d: TimeValue) => `${d}`}
    {...textOffset}
    fontSize={rule.fontSize}
    fill="var(--dct-timeline-axis, currentColor)"
    fillOpacity={rule.labelOpacity}
  />

  <Text
    data={[currentValue]}
    {...(isHorizontal ? { x: identity, y: 0 } : { x: 0, y: identity })}
    text={(d: TimeValue) => `${d}`}
    {...textOffset}
    fontSize={rule.activeFontSize}
    fontWeight={rule.activeFontWeight}
    fill={getConfiguration().timeline.activeColor}
  />
</Plot>
</div>
