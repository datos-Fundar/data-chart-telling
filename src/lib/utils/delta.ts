import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { Series } from '$lib/types/plots/data/common';
import type { DeltaConfig, DeltaTarget } from '$lib/types/markers/axis/delta';

export type ResolvedDelta = {
	cfg: DeltaConfig;
	at: number;
	from: number;
	to: number;
	diff: number;
	mid: number;
};

/**
 * Sorts `data` by `sortBy`, then finds the first adjacent pair where `scanBy`
 * brackets `target` and linearly interpolates `measureBy` at that crossing.
 *
 * X delta usage: sortBy=getX, scanBy=getX, measureBy=getY  → Y at given X
 * Y delta usage: sortBy=getX, scanBy=getY, measureBy=getX  → X at given Y (first crossing)
 */
function interpolate<T extends Record<string, unknown>>(
	data: T[],
	sortBy: (d: T) => number,
	scanBy: (d: T) => number,
	measureBy: (d: T) => number,
	target: number
): number | null {
	const sorted = [...data].sort((a, b) => sortBy(a) - sortBy(b));
	for (let i = 0; i < sorted.length; i++) {
		if (scanBy(sorted[i]) === target) return measureBy(sorted[i]);
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		const s0 = scanBy(sorted[i]);
		const s1 = scanBy(sorted[i + 1]);
		if ((s0 <= target && target <= s1) || (s1 <= target && target <= s0)) {
			const t = (target - s0) / (s1 - s0);
			return measureBy(sorted[i]) + t * (measureBy(sorted[i + 1]) - measureBy(sorted[i]));
		}
	}
	return null;
}

function resolveXDeltaEndpoint<T extends Record<string, unknown>>(
	allSeries: Series<T>[],
	target: DeltaTarget,
	atX: number
): number | null {
	if (target.type === 'axis') return target.value ?? 0;
	const s = allSeries.find((s) => s.name === target.series);
	if (!s) return null;
	const getX = (d: T) => Number(resolveAccessor(s.x)(d));
	const getY = (d: T) => Number(resolveAccessor(s.y)(d));
	return interpolate(s.data, getX, getX, getY, atX);
}

function resolveYDeltaEndpoint<T extends Record<string, unknown>>(
	allSeries: Series<T>[],
	target: DeltaTarget,
	atY: number
): number | null {
	if (target.type === 'axis') return target.value ?? 0;
	const s = allSeries.find((s) => s.name === target.series);
	if (!s) return null;
	const getX = (d: T) => Number(resolveAccessor(s.x)(d));
	const getY = (d: T) => Number(resolveAccessor(s.y)(d));
	return interpolate(s.data, getX, getY, getX, atY);
}

function buildDelta(cfg: DeltaConfig, from: number, to: number): ResolvedDelta {
	const diff = Math.abs(from - to);
	const mid = (from + to) / 2;
	return { cfg, at: Number(cfg.at), from, to, diff, mid };
}

export function resolveXDeltas<T extends Record<string, unknown>>(
	allSeries: Series<T>[],
	configs: DeltaConfig[]
): ResolvedDelta[] {
	return configs.flatMap((cfg) => {
		const atX = Number(cfg.at);
		const from = resolveXDeltaEndpoint(allSeries, cfg.from, atX);
		const to = cfg.to ? resolveXDeltaEndpoint(allSeries, cfg.to, atX) : 0;
		if (from === null || to === null) return [];
		return [buildDelta(cfg, from, to)];
	});
}

export function resolveYDeltas<T extends Record<string, unknown>>(
	allSeries: Series<T>[],
	configs: DeltaConfig[]
): ResolvedDelta[] {
	return configs.flatMap((cfg) => {
		const atY = Number(cfg.at);
		const from = resolveYDeltaEndpoint(allSeries, cfg.from, atY);
		const to = cfg.to ? resolveYDeltaEndpoint(allSeries, cfg.to, atY) : 0;
		if (from === null || to === null) return [];
		return [buildDelta(cfg, from, to)];
	});
}
