<script lang="ts">
  import { RuleX, RuleY } from 'svelteplot';
  import type { AxisValue } from '$lib/types/plots/axis';
  import type { StrokeStyle } from '$lib/types/plots/styling';

  /**
   * A single vertical (`axis: 'x'`) or horizontal (`axis: 'y'`) reference
   * line at `value` — the shared primitive behind `GeometryLayout`'s
   * `'rule'` marker dispatch (an author-configured rule) and
   * `HoverMarker` (the hover crosshair), the same way `DotMarker`/
   * `TextMarker` back both the marker-dispatch system and `HoverMarker`'s
   * own dot/label. Callers merge in their own default style (e.g.
   * `HoverMarker` layers `cfg.hover.rule` under an author override) — this
   * component's own fallback (`'currentColor'`/`1`) only kicks in when
   * neither supplies a value.
   */
  let { axis, value, style }: { axis: 'x' | 'y'; value: AxisValue; style?: StrokeStyle } = $props();

  const RuleMark = $derived(axis === 'x' ? RuleX : RuleY);
</script>

<RuleMark
  data={[{ v: value }]}
  {...axis === 'x' ? { x: (d: { v: AxisValue }) => d.v } : { y: (d: { v: AxisValue }) => d.v }}
  stroke={style?.stroke ?? 'currentColor'}
  strokeWidth={style?.strokeWidth ?? 1}
  strokeOpacity={style?.strokeOpacity ?? 1}
  strokeDasharray={style?.strokeDasharray}
/>
