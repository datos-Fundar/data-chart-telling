<script lang="ts">
	import { usePlot } from 'svelteplot';
	import {
		toProjectionLike,
		type ProjectionLike,
		type StreamingProjection
	} from '$lib/plots/utils/tiles';

	/** Reports the projection of the svelteplot `<Plot>` it is drawn in, as a function from `[lon, lat]` to pixels. */
	let { onProjection }: { onProjection: (projection: ProjectionLike | undefined) => void } =
		$props();

	const plot = usePlot();

	$effect(() => {
		const own = plot.scales.projection as unknown as StreamingProjection | undefined;
		onProjection(own ? toProjectionLike(own) : undefined);
	});
</script>
