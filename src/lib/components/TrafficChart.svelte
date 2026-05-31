<script lang="ts">
	import type { NetEvent } from '$lib/types';

	interface Props {
		events: NetEvent[];
		buckets?: number;
		spanMs?: number;
		height?: number;
	}
	let { events, buckets = 48, spanMs = 1000 * 60 * 60 * 6, height = 160 }: Props = $props();

	const W = 1000;

	// Bin events into time buckets by total bytes, plus alert markers.
	let bins = $derived.by(() => {
		const now = Date.now();
		const start = now - spanMs;
		const step = spanMs / buckets;
		const vol = new Array(buckets).fill(0);
		const alert = new Array(buckets).fill(0);
		for (const e of events) {
			if (e.ts < start) continue;
			const i = Math.min(buckets - 1, Math.floor((e.ts - start) / step));
			vol[i] += e.bytes;
			if (e.severity === 'alert') alert[i] += 1;
		}
		return { vol, alert };
	});

	let max = $derived(Math.max(1, ...bins.vol));

	// Area path across the buckets.
	let areaPath = $derived.by(() => {
		const pts = bins.vol.map((v, i) => {
			const x = (i / (buckets - 1)) * W;
			const y = height - (v / max) * (height - 14) - 4;
			return [x, y] as const;
		});
		if (!pts.length) return '';
		let d = `M ${pts[0][0]} ${height} L ${pts[0][0]} ${pts[0][1]}`;
		for (let i = 1; i < pts.length; i++) {
			const [x0, y0] = pts[i - 1];
			const [x1, y1] = pts[i];
			const mx = (x0 + x1) / 2;
			d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
		}
		d += ` L ${pts[pts.length - 1][0]} ${height} Z`;
		return d;
	});
</script>

<div class="chart-wrap">
	<svg viewBox="0 0 {W} {height}" preserveAspectRatio="none" class="chart" role="img" aria-label="Traffic volume over time">
		<defs>
			<linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="var(--ink)" stop-opacity="0.16" />
				<stop offset="100%" stop-color="var(--ink)" stop-opacity="0" />
			</linearGradient>
		</defs>

		{#each [0.25, 0.5, 0.75] as g}
			<line x1="0" x2={W} y1={height * g} y2={height * g} class="grid" />
		{/each}

		<path d={areaPath} fill="url(#trafficFill)" />

		{#each bins.vol as v, i}
			{@const x = (i / (buckets - 1)) * W}
			{@const y = height - (v / max) * (height - 14) - 4}
			<line x1={x} x2={x} y1={height} y2={y} class="bar" />
			{#if bins.alert[i] > 0}
				<circle cx={x} cy={y - 6} r="3.5" class="alert-dot" />
			{/if}
		{/each}
	</svg>
</div>

<style>
	.chart-wrap {
		width: 100%;
	}
	.chart {
		width: 100%;
		height: auto;
		display: block;
	}
	.grid {
		stroke: var(--ink-hair);
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}
	.bar {
		stroke: var(--ink);
		stroke-opacity: 0.34;
		stroke-width: 1.5;
		vector-effect: non-scaling-stroke;
	}
	.alert-dot {
		fill: var(--alert);
	}
</style>
