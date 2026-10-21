<script lang="ts">
	import { BulletPlot } from '@fundar/data-chart-telling';
	import { PROVINCE_LIFE } from './datasets';
</script>

<!-- Female life expectancy at birth by province: the bar, against a target of 80 years, over bands for under 76, 76 to 80 and over 80. -->
<BulletPlot
	width={720}
	height={400}
	data={PROVINCE_LIFE}
	x="female"
	y="province"
	target={80}
	ranges={[76, 80, 85]}
	scales={{ x: { domain: [70, 85] } }}
	styles={{ values: { show: true } }}
/>
