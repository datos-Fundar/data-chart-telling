<script module lang="ts">
	import type { LegendItem } from '$lib/types/layout/legend';

	const JURISDICCIONES = [
		'Buenos Aires',
		'Catamarca',
		'Chaco',
		'Chubut',
		'Ciudad Autónoma de Buenos Aires',
		'Córdoba',
		'Corrientes',
		'Entre Ríos',
		'Formosa',
		'Jujuy',
		'La Pampa',
		'La Rioja',
		'Mendoza',
		'Misiones',
		'Neuquén',
		'Río Negro',
		'Salta',
		'San Juan',
		'San Luis',
		'Santa Cruz',
		'Santa Fe',
		'Santiago del Estero',
		'Tierra del Fuego, Antártida e Islas del Atlántico Sur',
		'Tucumán'
	];
	const PALETTE = [
		'#4f46e5',
		'#e6580d',
		'#16a34a',
		'#dc2626',
		'#0891b2',
		'#9333ea',
		'#ca8a04',
		'#db2777'
	];

	/** The `items` this component feeds `<LegendLayout>` - exported for the story's docs source override, see `stories/common/docsSource.ts`. */
	export function jurisdictionItems(count: number): LegendItem[] {
		return JURISDICCIONES.slice(0, count).map((name, i) => ({
			name,
			color: PALETTE[i % PALETTE.length]
		}));
	}
</script>

<script lang="ts">
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import {
		getConfiguration,
		configToCssVars,
		cssVarsStyle
	} from '$lib/configuration/config.svelte';
	import type { LegendNavContext } from '$lib/types/layout/legend';

	/**
	 * `layout: { type: 'horizontal', maxRows }` can't be exercised meaningfully
	 * from a plain `sections` args array - wrapping/pagination only kicks in
	 * once the section is narrower than its items need, so this wrapper adds
	 * the one thing a story arg object can't express: a fixed-width container
	 * to wrap against. `customNavButton` exercises the other override path, a
	 * `navButton` snippet replacing the section's default arrow buttons.
	 *
	 * `LegendLayout` is used bare here (no `Plot`/`FigureChrome` around
	 * it), so - same as `FacetDemo` for facets - stamp the `--dct-*` vars
	 * ourselves; without them, `setConfiguration` changes the live config but
	 * nothing on screen ever reads it back out.
	 */
	let {
		itemCount = 24,
		maxRows = 1,
		width = 460,
		interactive = false,
		customNavButton = false
	}: {
		itemCount?: number;
		maxRows?: number;
		width?: number;
		interactive?: boolean;
		customNavButton?: boolean;
	} = $props();

	const items = $derived(jurisdictionItems(itemCount));

	const themeStyle = $derived(cssVarsStyle(configToCssVars(getConfiguration())));
</script>

<div style="{themeStyle}; width: {width}px">
	<LegendLayout
		sections={[
			{
				type: 'discrete',
				title: 'Jurisdiction',
				items,
				interactive: { enabled: interactive },
				layout: { type: 'horizontal', maxRows },
				navButton: customNavButton ? navSnippet : undefined
			}
		]}
	/>
</div>

{#snippet navSnippet({ direction, disabled, onclick }: LegendNavContext)}
	<button type="button" class="demo-nav" {disabled} {onclick}>
		{direction === 'prev' ? '◀ Prev' : 'Next ▶'}
	</button>
{/snippet}

<style>
	.demo-nav {
		padding: 0.2rem 0.6rem;
		border: none;
		border-radius: 0.25rem;
		background: #16a34a;
		color: #fff;
		font-size: 0.75rem;
		cursor: pointer;
	}
	.demo-nav:disabled {
		opacity: 0.35;
		cursor: default;
	}
</style>
