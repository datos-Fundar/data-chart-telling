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
 * — the ground truth for "did these two really interact," which `mirrorRanks`
 * needs and can't reliably reconstruct from positions alone after the fact
 * (see its own doc comment).
 */
export function declutter1D<T extends { pos: number }>(items: T[], minGap: number): Declutter1DResult<T> {
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

  const positions = sorted.map((d, i) => ({ ...d, pos: (down[i] + up[i]) / 2 }));
  return { positions, connected };
}

/**
 * Groups `declutter1D`'s own `connected` flags into runs (maximal stretches
 * of consecutive connected pairs), then assigns each run member a lane by
 * *mirrored* position within it: the run's top and bottom member share lane
 * 0, the next-in-from-top and next-in-from-bottom share lane 1, and so on
 * toward the run's centre (an odd-sized run's exact middle member gets the
 * innermost lane alone). `depth` is the run's own size, the same for every
 * member; the number of *distinct* lanes it actually needs is
 * `ceil(depth / 2)`.
 *
 * Deliberately doesn't re-derive connectivity from before/after positions —
 * an early version tried that (some mix of "both moved" and "final gap is
 * near minGap") and it's unreliable both ways: a real one-sided interaction
 * (an item that only moved because its neighbour got pushed into it) can
 * settle with more slack than minGap, so a gap-threshold check misses it;
 * and "both moved" over-connects, since two unrelated, far-apart clusters
 * that each independently needed to declutter still each have moved members
 * sitting next to each other in sort order, which a moved-only check can't
 * tell apart from a real interaction. `declutter1D`'s own `connected` array
 * has neither problem, because it's not inferred — it's the actual record
 * of which pushes happened.
 *
 * Meant to drive a leader line's lane: `rank` 0 bends right off the data
 * point (a short first stub); higher ranks travel further before bending
 * (right up to the shared label column, for a run's own centre member).
 * Two members sharing a lane never collide: by how `declutter1D` centers
 * its result, a run's top half only ever ends up at or above its original
 * spot and its bottom half only ever at or below, so paired members bend
 * away from each other — same lane, opposite direction, no shared space.
 * This also roughly halves the lane depth (and so the horizontal room) a
 * run needs, versus giving every member its own lane.
 */
export function mirrorRanks(connected: boolean[]): { rank: number; depth: number }[] {
  const n = connected.length + 1;
  const out = Array.from({ length: n }, () => ({ rank: 0, depth: 1 }));
  let i = 0;
  while (i < n) {
    let j = i;
    while (j < connected.length && connected[j]) j++;
    const runLength = j - i + 1;
    if (runLength > 1) {
      for (let k = i; k <= j; k++) {
        const posInRun = k - i;
        out[k] = { rank: Math.min(posInRun, runLength - 1 - posInRun), depth: runLength };
      }
    }
    i = j + 1;
  }
  return out;
}
