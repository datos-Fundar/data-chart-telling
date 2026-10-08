<script lang="ts">
	import { usePlot } from 'svelteplot';
	import { getMarginReport } from '$lib/layout/facet/alignment';

	/** Reports the margins svelteplot settled on to an enclosing listener (an aligned facet grid), if any. */
	const report = getMarginReport();
	const plot = usePlot();

	let last = '';
	$effect(() => {
		if (!report) return;
		const { marginTop, marginRight, marginBottom, marginLeft } = plot.options;
		const margins = {
			top: Number(marginTop) || 0,
			right: Number(marginRight) || 0,
			bottom: Number(marginBottom) || 0,
			left: Number(marginLeft) || 0
		};
		const key = JSON.stringify(margins);
		if (key === last) return;
		last = key;
		report(margins);
	});
</script>
