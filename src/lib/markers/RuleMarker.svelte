<script lang="ts">
  import { RuleX, RuleY } from 'svelteplot';
  import type { AxisValue } from '$lib/types/layout/scales';
  import type { StrokeStyle } from '$lib/types/plots/styling';

  /**
   * A single vertical (`axis: 'x'`) or horizontal (`axis: 'y'`) reference
   * line at `value` — shared by author-configured `'rule'` markers and
   * `HoverMarker`'s crosshair. Falls back to `'currentColor'`/`1` when the
   * caller supplies no style.
   */
  let { axis, value, styles }: { axis: 'x' | 'y'; value: AxisValue; styles?: StrokeStyle } = $props();

  const RuleMark = $derived(axis === 'x' ? RuleX : RuleY);
</script>

<RuleMark
  data={[{ v: value }]}
  {...axis === 'x' ? { x: (d: { v: AxisValue }) => d.v } : { y: (d: { v: AxisValue }) => d.v }}
  stroke={styles?.stroke ?? 'currentColor'}
  strokeWidth={styles?.strokeWidth ?? 1}
  strokeOpacity={styles?.strokeOpacity ?? 1}
  strokeDasharray={styles?.strokeDasharray}
/>
