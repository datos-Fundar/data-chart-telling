import type { Box } from '$lib/layout/margins/Box';
import type { MarginSide } from '$lib/types/plots/props';

/** Where a box sits along one axis, next to a point: before it, centred on it, or after it. */
export type BoxAnchor = 'before' | 'middle' | 'after';

/** A {@link BoxAnchor} per axis. */
export type BoxAnchors = { x: BoxAnchor; y: BoxAnchor };

/** Where a box goes next to a point: the side it ends up on, per axis, and its offset from the point. */
export type BoxFlip = { anchor: BoxAnchors; dx: number; dy: number };

/**
 * A box placed around a point (its origin), and the plot edges that point
 * can sit on: how far the box reaches past each of those edges is room the
 * plot's margins keep for it - see `PlotMargins`.
 */
export type EdgeBox = { box: Box; edges: MarginSide[] };
