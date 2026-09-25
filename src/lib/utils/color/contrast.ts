import { resolveCssColor, parseRgb } from './cssColor';

function relativeLuminance([r, g, b]: [number, number, number]): number {
	const [rs, gs, bs] = [r, g, b].map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** WCAG contrast ratio between two colors, from 1 (no contrast) to 21 (black on white). */
export function contrastRatio(colorA: string, colorB: string): number {
	const a = parseRgb(resolveCssColor(colorA));
	const b = parseRgb(resolveCssColor(colorB));
	if (!a || !b) return 1;
	const lA = relativeLuminance(a);
	const lB = relativeLuminance(b);
	const lighter = Math.max(lA, lB);
	const darker = Math.min(lA, lB);
	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The `candidates` entry with the highest WCAG contrast ratio against
 * `background`. Defaults to plain white/black; pass a grayscale or other
 * palette to widen the choice. Falls back to the first candidate when
 * `background` can't be parsed.
 */
export function contrastTextColor(
	background: string,
	candidates: string[] = ['#ffffff', '#000000']
): string {
	if (candidates.length === 0) return '#000000';
	let best = candidates[0];
	let bestRatio = -Infinity;
	for (const candidate of candidates) {
		const ratio = contrastRatio(background, candidate);
		if (ratio > bestRatio) {
			bestRatio = ratio;
			best = candidate;
		}
	}
	return best;
}
