<script lang="ts">
	interface Props {
		label: string;
		value: string | number;
		hint?: string;
		accent?: 'ink' | 'trust' | 'accent' | 'alert';
		muted?: boolean;
	}
	let { label, value, hint, accent = 'ink', muted = false }: Props = $props();
</script>

<div class="stat" data-accent={accent} class:muted>
	<span class="stat-label">{label}</span>
	<div class="stat-value">{value}</div>
	{#if hint}
		<div class="stat-hint">{hint}</div>
	{/if}
</div>

<style>
	.stat {
		position: relative;
		padding: 18px 20px 20px;
		background: var(--bg-card);
		border: 1px solid var(--ink-hair);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-card);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.stat-label {
		font-size: 12px;
		font-weight: 500;
		letter-spacing: -0.005em;
		color: var(--ink-mute);
	}
	.stat-value {
		font-family: 'Instrument Sans', sans-serif;
		font-weight: 500;
		font-size: clamp(28px, 2.6vw, 36px);
		line-height: 1;
		letter-spacing: -0.035em;
		color: var(--ink);
	}
	.stat.muted .stat-value {
		color: var(--ink-faint);
	}
	.stat-hint {
		font-size: 12.5px;
		color: var(--ink-mute);
		line-height: 1.4;
	}
</style>
