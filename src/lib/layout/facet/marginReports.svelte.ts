import { withMarginReport } from '$lib/layout/facet/alignment';
import type { CellMargins } from '$lib/layout/facet/alignment';

/** Collects facets' reported margins, exposing them once they stop changing for `delay` ms. */
export function createMarginReports(delay = 150) {
	let live: Record<string, CellMargins> = {};
	let settled = $state<Record<string, CellMargins>>({});
	let timer: ReturnType<typeof setTimeout> | undefined;
	return {
		get settled() {
			return settled;
		},
		report(key: string, margins: CellMargins) {
			const next = withMarginReport(live, key, margins);
			if (next === live) return;
			live = next;
			clearTimeout(timer);
			timer = setTimeout(() => (settled = live), delay);
		}
	};
}
