<script lang="ts">
	import DotMarker from './DotMarker.svelte';
	import TextMarker from './TextMarker.svelte';
	import type { DotStyle, FontStyle } from '$lib/types/plots/styling';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data?: Record<string, any>[];
		yProp?: string;
		xProp?: string;
		mode?: 'max' | 'min';
		label?: string;
		dot?: DotStyle;
		text?: FontStyle;
	}

	const {
		data = [],
		yProp = 'value',
		xProp = 'x',
		mode = 'max',
		label,
		dot,
		text
	}: Props = $props();

	const resolvedDotFill = $derived(dot?.dotFill ?? 'currentColor');
	const resolvedDotStroke = $derived(dot?.dotStroke ?? 'currentColor');
	const resolvedTextFill = $derived(text?.fill ?? 'currentColor');

	const peakPoint = $derived.by(() => {
		if (data.length === 0) return null;

		return data.reduce((peak, current) => {
			const currentY = current[yProp];
			const peakY = peak[yProp];

			if (mode === 'max') {
				return currentY > peakY ? current : peak;
			} else {
				return currentY < peakY ? current : peak;
			}
		});
	});

	const peakX = $derived(peakPoint ? peakPoint[xProp] : null);
	const peakY = $derived(peakPoint ? peakPoint[yProp] : null);

	const resolvedDotStyle = $derived<DotStyle>({
		...dot,
		dotFill: resolvedDotFill,
		dotStroke: resolvedDotStroke
	});

	const resolvedTextStyle = $derived<FontStyle>({
		...text,
		fill: resolvedTextFill,
		fontWeight: text?.fontWeight ?? 'bold',
		dy: text?.dy ?? -15
	});
</script>

{#if peakPoint}
	<DotMarker
		marker={{
			type: 'dot',
			data: [peakPoint],
			x: () => peakX,
			y: () => peakY,
			styles: resolvedDotStyle
		}}
	/>
	{#if label}
		<TextMarker
			marker={{
				type: 'text',
				data: [peakPoint],
				x: () => peakX,
				y: () => peakY,
				text: label,
				styles: resolvedTextStyle
			}}
		/>
	{/if}
{/if}
