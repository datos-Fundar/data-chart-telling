export type Declutter1DResult<T> = {
  /** Sorted input, each with `.pos` replaced by its decluttered position. */
  positions: T[];
  /**
   * `connected[i]` is true when `positions[i]` and `positions[i + 1]` were
   * actually pushed apart by the algorithm — either the down-pass pushed
   * `i + 1` down because of `i`, or the up-pass pulled `i` up because of
   * `i + 1`. `length === positions.length - 1`.
   */
  connected: boolean[];
};

/**
 * Spreads a set of pixel-space positions apart along one axis so that no two
 * end up closer than `minGap`, while keeping the overall block centered on
 * the original positions. Computes two independent, individually-valid
 * arrangements — a forward pass that only ever pushes items *down* to clear
 * the one above it, and a backward pass that only ever pushes items *up* to
 * clear the one below — then averages them index-by-index.
 *
 * A pass chained directly onto the other's output (push down, *then* pull up
 * on the already-pushed result) is a no-op: by the time the down-pass
 * finishes, `sorted[i] >= sorted[i-1] + minGap` already holds everywhere,
 * which is exactly the condition an up-pass would otherwise "fix". Averaging
 * two independent passes instead is what actually centers the block; it
 * still keeps every adjacent gap >= minGap, since each pass's own gaps are
 * already >= minGap and the average of two such gaps is too.
 *
 * Also records, per adjacent pair, whether either pass actually had to push
 * — the ground truth for "did these two really interact," which
 * `laneAssignment` needs and can't reliably reconstruct from positions alone
 * after the fact (see its own doc comment).
 *
 * `bounds`, if given, keeps every *run* (a maximal stretch of connected
 * items — lone, unconnected items are left at their true position
 * regardless) inside `[lo, hi]`: nothing pushed apart by this function is
 * ever allowed to end up off the edge of whatever pixel range the caller
 * considers in-bounds (typically the plot's own content box). A run that
 * already fits is only shifted, never resized; a run too big to fit even
 * at its natural spacing is shrunk just enough to fit, uniformly, so it's
 * still evenly spaced — just tighter than `minGap` calls for. See
 * `fitRunsWithinBounds` for the actual shift/shrink math.
 *
 * `bounds` also biases *which* pass a run's average leans on, via
 * {@link runBiasWeights}: a run sitting close to one edge has little slack on
 * that side, so a plain 50/50 blend would still ask the up-pass and
 * down-pass to pull the block symmetrically toward *both* edges before
 * `fitRunsWithinBounds` shifts/shrinks it back — the up-pass reaching for
 * room that was never really there, needlessly widening how far members end
 * up travelling from their original positions (`laneAssignment`'s own lane
 * count grows with exactly that travel distance — see its doc comment) — so
 * a run near an edge leans toward whichever pass already grows away from it
 * instead — the block still expands to clear `minGap` everywhere, just
 * mostly in the one direction that was actually available, the way a person
 * sliding books apart on a shelf pinned against one wall would.
 */
export function declutter1D<T extends { pos: number }>(
  items: T[],
  minGap: number,
  bounds?: readonly [number, number],
): Declutter1DResult<T> {
  const sorted = [...items].sort((a, b) => a.pos - b.pos);
  const n = sorted.length;
  const connected = new Array<boolean>(Math.max(0, n - 1)).fill(false);

  const down = sorted.map((d) => d.pos);
  for (let i = 1; i < n; i++) {
    const pushed = down[i - 1] + minGap;
    if (pushed > down[i]) {
      down[i] = pushed;
      connected[i - 1] = true;
    }
  }

  const up = sorted.map((d) => d.pos);
  for (let i = n - 2; i >= 0; i--) {
    const pulled = up[i + 1] - minGap;
    if (pulled < up[i]) {
      up[i] = pulled;
      connected[i] = true;
    }
  }

  const weights = bounds ? runBiasWeights(down, up, connected, bounds) : sorted.map(() => 0.5);
  const averaged = sorted.map((_, i) => down[i] * weights[i] + up[i] * (1 - weights[i]));
  const fitted = bounds ? fitRunsWithinBounds(averaged, connected, bounds) : averaged;
  const positions = sorted.map((d, i) => ({ ...d, pos: fitted[i] }));
  return { positions, connected };
}

/**
 * Per-run blend weight (applied to the down-pass; `1 - weight` goes to the
 * up-pass) favouring whichever pass already grows away from the nearer edge
 * — see {@link declutter1D}'s doc comment for why. `0.5` (the down/up
 * midpoint, i.e. no bias) when a run's naturally-centred span has roughly
 * equal room on both sides; sliding toward `1` (all down-pass) as room above
 * vanishes, toward `0` (all up-pass) as room below vanishes. Every member of
 * a run gets the *same* weight — the point is the block moving as one
 * (mostly) one-directional piece, not each member picking its own bias.
 */
function runBiasWeights(down: number[], up: number[], connected: boolean[], [lo, hi]: readonly [number, number]): number[] {
  const weights = down.map(() => 0.5);
  let i = 0;
  while (i < down.length) {
    let j = i;
    while (j < connected.length && connected[j]) j++;
    if (j > i) {
      const center = ((down[i] + up[i]) / 2 + (down[j] + up[j]) / 2) / 2;
      const roomAbove = Math.max(0, center - lo);
      const roomBelow = Math.max(0, hi - center);
      const total = roomAbove + roomBelow;
      const weight = total > 0 ? roomBelow / total : 0.5;
      for (let k = i; k <= j; k++) weights[k] = weight;
    }
    i = j + 1;
  }
  return weights;
}

/**
 * Shifts, and shrinks only if it must, each run of `connected` positions so
 * it lands entirely inside `[lo, hi]`. A run's own relative spacing is
 * preserved as-is (just translated) whenever it already fits in `hi - lo`;
 * only a run wider than the available space gets uniformly scaled down
 * around its centre first. Lone, unconnected positions pass through
 * untouched — they were never pushed by `declutter1D` in the first place,
 * so clamping one to the bounds would move a label away from the data point
 * it's honestly reporting, for no collision-avoidance reason at all.
 */
function fitRunsWithinBounds(positions: number[], connected: boolean[], [lo, hi]: readonly [number, number]): number[] {
  const out = [...positions];
  const available = hi - lo;
  let i = 0;
  while (i < out.length) {
    let j = i;
    while (j < connected.length && connected[j]) j++;
    if (j > i) {
      const runMin = out[i];
      const runMax = out[j];
      if (runMin < lo || runMax > hi) {
        const naturalSpan = runMax - runMin;
        const scale = naturalSpan > 0 ? Math.min(1, available / naturalSpan) : 1;
        const idealCenter = (runMin + runMax) / 2;
        const newSpan = naturalSpan * scale;
        const newCenter = Math.min(Math.max(idealCenter, lo + newSpan / 2), hi - newSpan / 2);
        for (let k = i; k <= j; k++) {
          out[k] = newCenter + (out[k] - idealCenter) * scale;
        }
      }
    }
    i = j + 1;
  }
  return out;
}

/**
 * Groups `declutter1D`'s own `connected` flags into runs (maximal stretches
 * of consecutive connected pairs), then gives every run member its own,
 * unique lane — no two members ever share one, deliberately (see below) —
 * ordered so that a leader line drawn through lane `rank` never crosses, or
 * even draws visually flush against, one drawn through any other lane of
 * the same run.
 *
 * Every member's leader line is the same three-segment elbow: a horizontal
 * stub from the data point out to its lane, a vertical run up/down that
 * lane to the label's height, then a final horizontal run in to the shared
 * label column. Two such elbows, `i` (in the tighter of the two lanes) and
 * `j` (further out), are safe from crossing *specifically* when neither of
 * these can happen:
 * - `j`'s own stub (at `j`'s original height) reaches out past `i`'s lane
 *   while `i`'s vertical run passes through that height — `j`'s stub would
 *   cut across `i`'s vertical segment.
 * - `i`'s final run (at `i`'s label height) reaches past `i`'s own lane out
 *   to the shared column, and in doing so crosses `j`'s lane while `j`'s
 *   vertical run passes through *that* height — `i`'s own final segment
 *   would cut across `j`'s vertical segment.
 *
 * Whether `i` can safely take the tighter lane depends on both members'
 * *actual* pixel geometry — not simply on which one moved further — so each
 * pair is checked directly per {@link saferNearer} rather than inferred from
 * a single sort key. A pair with a clean, provable answer either way (the
 * overwhelmingly common case for `declutter1D`'s own output) is ordered by
 * that answer; a pair with no clean answer (both directions equally
 * "unsafe," or, symmetrically, both fine) falls back to the same *travel
 * distance* heuristic used before this per-pair check existed — furthest
 * `|final - original|` first — which is what decides ties and keeps the
 * "furthest traveller gets the tightest lane, so it starts bending
 * immediately rather than reaching across everyone else's leader lines
 * first" intent for every pair the geometry itself doesn't already settle.
 *
 * No sharing, ever, is the other half of this: two members can only have
 * non-overlapping travel spans (and so pass the old, now-removed,
 * share-a-lane check) by sitting far apart along the axis — but "far apart"
 * is exactly the case with the most room to spare, so it never needed the
 * lane it would save by sharing, while any pair close enough to actually be
 * short on room has spans close enough together that sharing draws their
 * two leader lines only a couple pixels apart — visually indistinguishable
 * from one continuous line touching the next label down. A run of `n`
 * members uses exactly `n` lanes; letting the lane count grow is the price
 * of a fan that never has two leader lines touching *or* crossing, and
 * `ValueLabels`' own auto-margin measurement (see its doc comment) already
 * grows `margins.right` to fit however many lanes that turns out to be, so
 * nothing has to be guessed up front.
 *
 * `rank` is the lane index (0-indexed) to drive a leader line's routing:
 * `rank` 0 bends right off the data point (a short first stub); higher
 * ranks travel further before bending (right up to the shared label
 * column). `lanesUsed` is the run's own total lane count — always equal to
 * `runSize` — shared by every member; `runSize` is the run's member count,
 * for callers that just need to know whether a given member belongs to a
 * real run at all.
 */
export function laneAssignment(
  originals: number[],
  finals: number[],
  connected: boolean[],
): { rank: number; lanesUsed: number; runSize: number }[] {
  const n = connected.length + 1;
  const out = Array.from({ length: n }, () => ({ rank: 0, lanesUsed: 1, runSize: 1 }));
  const span = (k: number): [number, number] => {
    const a = originals[k];
    const b = finals[k];
    return a < b ? [a, b] : [b, a];
  };
  const distance = (k: number) => Math.abs(finals[k] - originals[k]);

  /** Whether lane-`i`-nearer-than-`j` is provably crossing-free — see this function's doc comment. */
  function saferNearer(i: number, j: number): boolean {
    const [loI, hiI] = span(i);
    const [loJ, hiJ] = span(j);
    const jStubCutsI = originals[j] >= loI && originals[j] <= hiI;
    const iFinalCutsJ = finals[i] >= loJ && finals[i] <= hiJ;
    return !jStubCutsI && !iFinalCutsJ;
  }

  let i = 0;
  while (i < n) {
    let j = i;
    while (j < connected.length && connected[j]) j++;
    const runSize = j - i + 1;
    if (runSize > 1) {
      // Members of this run, ordered so each is provably safe to place
      // nearer than the next whenever that's decidable, furthest-travelled
      // first otherwise (ties keep their original — i.e. top-to-bottom —
      // order, since `sort` is stable). Position in this order *is* the
      // rank: no sharing.
      const order = Array.from({ length: runSize }, (_, k) => i + k).sort((a, b) => {
        const aNearer = saferNearer(a, b);
        const bNearer = saferNearer(b, a);
        if (aNearer !== bNearer) return aNearer ? -1 : 1;
        return distance(b) - distance(a);
      });
      order.forEach((k, rank) => {
        out[k] = { rank, lanesUsed: runSize, runSize };
      });
    }
    i = j + 1;
  }
  return out;
}
