<script lang="ts">
	import type { Device } from '$lib/types';
	import { known } from '$lib/stores/known.svelte';
	import { formatBytes } from '$lib/data/generate';
	import { deviceGlyph, timeAgo, assessWorry, worryColor } from '$lib/utils';
	import { t } from '$lib/i18n';

	interface Props {
		device: Device;
	}
	let { device }: Props = $props();

	let events = $derived(known.eventsForDevice(device.id));
	let bytes = $derived(known.bytesForDevice(device.id));
	let alerts = $derived(events.filter((e) => e.severity === 'alert').length);
	let trusted = $derived(known.isTrusted(device.id));
	let lastTs = $derived(events.length ? events[0].ts : device.firstSeen);
	let worry = $derived(assessWorry(device, events));
</script>

<div class="card" class:flagged={alerts > 0}>
	<div class="card-head">
		<span class="glyph">{deviceGlyph(device.category)}</span>
		<div class="head-text">
			<span class="name">{device.name}</span>
			<span class="vendor mono">{device.vendor} · {device.ip}</span>
		</div>
		<span class="trust-pill" class:on={trusted}>
			{trusted ? 'Trusted' : 'Watched'}
		</span>
	</div>

	<div class="card-stats">
		<div class="cs">
			<span class="cs-val">{events.length}</span>
			<span class="cs-lab mono">events</span>
		</div>
		<div class="cs">
			<span class="cs-val">{formatBytes(bytes)}</span>
			<span class="cs-lab mono">traffic</span>
		</div>
		<div class="cs">
			<span class="cs-val" class:alert={alerts > 0}>{alerts}</span>
			<span class="cs-lab mono">alerts</span>
		</div>
	</div>

	<div class="worry-bar" data-level={worry.level}>
		<span class="worry-dot" style="background:{worryColor(worry.level)}"></span>
		<div class="worry-text">
			<div class="worry-head">
				<span class="worry-label">{t.worry.label}</span>
				<span class="worry-status" style="color:{worryColor(worry.level)}">
					{worry.level === 'clear' ? t.worry.clear
					: worry.level === 'normal' ? t.worry.normal
					: worry.level === 'watch' ? t.worry.watch
					: t.worry.alert}
				</span>
			</div>
			<p class="worry-detail">{worry.detail}</p>
			{#if worry.hint}
				<p class="worry-hint">
					<span class="worry-hint-label mono">{t.worry.reduce}:</span>
					{worry.hint}
				</p>
			{/if}
		</div>
	</div>

	<div class="card-foot">
		<span class="last mono">last seen {timeAgo(lastTs)}</span>
		<button
			class="trust-toggle mono"
			onclick={() => known.setTrusted(device.id, !trusted)}
		>
			{trusted ? 'Move to watched' : 'Mark trusted'}
		</button>
	</div>
</div>

<style>
	.card {
		position: relative;
		padding: 22px 22px 18px;
		background: var(--bg-card);
		border: 1px solid var(--ink-hair);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-card);
		display: flex;
		flex-direction: column;
		gap: 18px;
		overflow: hidden;
		transition:
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.card:hover {
		border-color: var(--ink-faint);
		box-shadow: var(--shadow-raised);
	}
	.card.flagged::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--alert);
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: 13px;
	}
	.glyph {
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		display: grid;
		place-items: center;
		border-radius: 11px;
		background: var(--bg-sunken);
		font-size: 17px;
		color: var(--ink-mute);
	}
	.head-text {
		display: flex;
		flex-direction: column;
		gap: 3px;
		flex: 1;
		min-width: 0;
	}
	.name {
		font-size: 16px;
		font-weight: 600;
		letter-spacing: -0.015em;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.vendor {
		font-size: 10.5px;
		color: var(--ink-mute);
	}
	.trust-pill {
		font-family: 'Space Mono', monospace;
		font-size: 9px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 4px 9px;
		border-radius: var(--r-pill);
		background: var(--bg-sunken);
		color: var(--ink-mute);
		flex-shrink: 0;
	}
	.trust-pill.on {
		background: var(--accent-soft);
		color: var(--accent);
	}

	.card-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		padding: 16px 0;
		border-top: 1px solid var(--ink-hair);
		border-bottom: 1px solid var(--ink-hair);
	}
	.cs {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.cs-val {
		font-family: 'Instrument Sans', sans-serif;
		font-weight: 500;
		font-size: 22px;
		letter-spacing: -0.02em;
		color: var(--ink);
	}
	.cs-val.alert {
		color: var(--alert);
	}
	.cs-lab {
		font-size: 9.5px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.worry-bar {
		display: flex;
		gap: 12px;
		padding: 14px 0;
		border-top: 1px solid var(--ink-hair);
		border-bottom: 1px solid var(--ink-hair);
	}
	.worry-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		margin-top: 5px;
		transition: background 0.3s var(--ease);
	}
	.worry-text {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}
	.worry-head {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.worry-label {
		font-family: 'Space Mono', monospace;
		font-size: 9.5px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}
	.worry-status {
		font-size: 12px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}
	.worry-detail {
		font-size: 12.5px;
		line-height: 1.45;
		color: var(--ink-soft);
	}
	.worry-hint {
		font-size: 11.5px;
		line-height: 1.4;
		color: var(--ink-mute);
		margin-top: 2px;
	}
	.worry-hint-label {
		font-size: 9px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-right: 4px;
	}

	.card-foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}
	.last {
		font-size: 10.5px;
		color: var(--ink-mute);
	}
	.trust-toggle {
		font-size: 10.5px;
		letter-spacing: 0.04em;
		color: var(--ink-soft);
		padding: 5px 0;
		border-bottom: 1px solid var(--ink-faint);
		transition: color 0.2s var(--ease);
	}
	.trust-toggle:hover {
		color: var(--ink);
	}
</style>
