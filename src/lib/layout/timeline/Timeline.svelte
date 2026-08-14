<script lang="ts">
  import { Plot, RuleX, RuleY, Text } from 'svelteplot';
  import type { Orientation, TimeValue } from '$lib/types/layout/timeline';

  /**
   * Purely visual time axis: a baseline rule plus the ordered step labels with
   * the current step emphasised. It has no notion of data — it just draws the
   * `values` it is handed and highlights `currentValue`. Colours come from CSS
   * variables so a host app can theme it.
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

  const isHorizontal = $derived(orientation === 'horizontal');
  const crossKey = $derived(isHorizontal ? 'y' : 'x');

  const domain = $derived.by(() => {
    const sorted = [...values].sort((a, b) => a - b);
    return [sorted[0], sorted[sorted.length - 1]];
  });

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
    strokeOpacity={0.7}
    strokeWidth={1.5}
  />

  <Text
    data={baseValues}
    {...(isHorizontal ? { x: identity, y: 0 } : { x: 0, y: identity })}
    text={(d: TimeValue) => `${d}`}
    {...textOffset}
    fontSize={12}
    fill="var(--dct-timeline-axis, currentColor)"
    fillOpacity={0.55}
  />

  <Text
    data={[currentValue]}
    {...(isHorizontal ? { x: identity, y: 0 } : { x: 0, y: identity })}
    text={(d: TimeValue) => `${d}`}
    {...textOffset}
    fontSize={20}
    fontWeight="bold"
    fill="var(--dct-timeline-active, #e6580d)"
  />
</Plot>
